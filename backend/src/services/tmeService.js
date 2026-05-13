const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');

const buildStrictRFC3986 = (str) => encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

const tmeRequest = async (endpoint, params) => {
    const token = process.env.TME_TOKEN;
    const appSecret = process.env.TME_APP_SECRET;

    if (!token || !appSecret) {
        throw new Error("TME API credentials are missing from .env");
    }

    params.Token = token;
    
    // Sort parameters alphabetically by key
    const keysToSign = Object.keys(params).sort();
    
    // URL-encode securely for base
    const encodedParams = keysToSign.map(k => buildStrictRFC3986(k) + '=' + buildStrictRFC3986(params[k])).join('&');

    const url = 'https://api.tme.eu/' + endpoint;
    const signatureBase = 'POST' + '&' + buildStrictRFC3986(url) + '&' + buildStrictRFC3986(encodedParams);

    const signature = crypto.createHmac('sha1', appSecret).update(signatureBase).digest('base64');
    params.ApiSignature = signature;

    const response = await axios.post(
        url,
        qs.stringify(params), 
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
};

const searchTME = async (components) => {
    if (!process.env.TME_TOKEN || !process.env.TME_APP_SECRET) {
        console.warn('TME API credentials are missing. Returning stubs.');
        return components.map(c => ({ name: c.name, tme: { error: 'Credentials missing' } }));
    }

    const results = [];
    
    for (const component of components) {
        try {
            // STEP 1: Search for the product to get its exact Symbol and Info page
            const searchParams = {
                Country: 'US', // adjust as needed
                Language: 'EN', // adjust as needed
                SearchPlain: component.name
            };

            const searchData = await tmeRequest('Products/Search.json', searchParams);
            const productList = searchData?.Data?.ProductList || [];

            if (productList.length > 0) {
                const part = productList[0];
                const exactSymbol = part.Symbol;
                
                // STEP 2: Fetch Prices and Stock for that exact Symbol
                const stockParams = {
                    Country: 'US',
                    Language: 'EN',
                    'SymbolList[0]': exactSymbol
                };

                const stockData = await tmeRequest('Products/GetPricesAndStocks.json', stockParams);
                const stockList = stockData?.Data?.ProductList || [];
                
                let inStock = '0';
                let price = 'N/A';
                
                if (stockList.length > 0) {
                    const exactStockData = stockList[0];
                    inStock = exactStockData.Amount?.toString() || '0';
                    
                    if (exactStockData.PriceList && exactStockData.PriceList.length > 0) {
                        const requestedQty = component.quantity || 1;
                        let bestPrice = exactStockData.PriceList[0].PriceValue;
                        
                        for (const priceBreak of exactStockData.PriceList) {
                            if (requestedQty >= priceBreak.Amount) {
                                bestPrice = priceBreak.PriceValue;
                            }
                        }
                        
                        price = '$' + bestPrice.toString();
                    }
                }

                results.push({
                    name: component.name,
                    tme: {
                        inStock: inStock, 
                        price: price, 
                        url: part.ProductInformationPage ? 'https:' + part.ProductInformationPage : 'N/A',
                        manufacturer: part.Producer || 'N/A'
                    }
                });
            } else {
                results.push({ name: component.name, tme: { inStock: '0', price: 'N/A', error: 'Not found' } });
            }
        } catch (error) {
            console.error(`TME API error for ${component.name}:`, error.response?.data || error.message);
            const errorMessage = error.response?.data?.Status || error.message || 'API Request Failed';
            results.push({ name: component.name, tme: { error: errorMessage } });
        }
    }
    return results;
};

module.exports = { searchTME };
