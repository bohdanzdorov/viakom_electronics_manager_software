const axios = require('axios');
const qs = require('qs');

// We cache the token in memory to avoid requesting a new one for every search.
let cachedToken = null;
let tokenExpiration = 0;

const getDigiKeyToken = async () => {
    const clientId = process.env.DIGIKEY_CLIENT_ID;
    const clientSecret = process.env.DIGIKEY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('DigiKey Credentials missing');
    }

    // Return cached token if valid (with 60-second safety buffer)
    if (cachedToken && Date.now() < tokenExpiration - 60000) {
        return cachedToken;
    }

    const data = qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
    });

    const config = {
        method: 'post',
        url: 'https://api.digikey.com/v1/oauth2/token',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    try {
        const response = await axios(config);
        cachedToken = response.data.access_token;
        tokenExpiration = Date.now() + (response.data.expires_in * 1000);
        return cachedToken;
    } catch (err) {
        console.error("DigiKey Auth Detailed Error:", err.response?.data || err.message);
        throw err;
    }
};

const searchDigikey = async (components) => {
    const clientId = process.env.DIGIKEY_CLIENT_ID;
    
    if (!clientId || !process.env.DIGIKEY_CLIENT_SECRET) {
        console.warn('DigiKey API credentials are missing. Returning stubs.');
        return components.map(c => ({ name: c.name, digikey: { error: 'Credentials missing' } }));
    }

    const results = [];
    let token;
    
    try {
        token = await getDigiKeyToken();
    } catch (authError) {
        console.error('DigiKey Auth Error:', authError.message);
        return components.map(c => ({ name: c.name, digikey: { error: 'Authentication Failed' } }));
    }

    // Process sequentially (similar to Mouser) to avoid rate limits
    for (const component of components) {
        try {
            const response = await axios.post(
                'https://api.digikey.com/products/v4/search/keyword',
                {
                    Keywords: component.name,
                    RecordCount: 1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-DIGIKEY-Client-Id': clientId,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const products = response.data?.ExactMatches || response.data?.Products || [];
            
            if (products.length > 0) {
                const part = products[0];
                let price = 'N/A';
                
                // In Digikey v4, pricing is nested inside ProductVariations[0].StandardPricing
                if (part.ProductVariations && part.ProductVariations.length > 0) {
                    const variation = part.ProductVariations[0];
                    if (variation.StandardPricing && variation.StandardPricing.length > 0) {
                        const requestedQty = component.quantity || 1;
                        let bestPrice = variation.StandardPricing[0].UnitPrice; 
                        
                        for (const priceBreak of variation.StandardPricing) {
                            if (requestedQty >= priceBreak.BreakQuantity) {
                                bestPrice = priceBreak.UnitPrice;
                            }
                        }
                        price = bestPrice;
                    } else if (part.UnitPrice) {
                        // Fallback to top-level UnitPrice if Variations pricing is unavailable
                        price = part.UnitPrice;
                    }
                } else if (part.UnitPrice) {
                    price = part.UnitPrice;
                }

                results.push({
                    name: component.name,
                    digikey: {
                        inStock: part.QuantityAvailable ? part.QuantityAvailable.toString() : '0',
                        price: price,
                        url: part.ProductUrl || 'N/A',
                        manufacturer: part.Manufacturer?.Name || 'N/A' 
                    }
                });
            } else {
                results.push({ name: component.name, digikey: { inStock: '0', price: 'N/A', error: 'Not found' } });
            }
        } catch (error) {
            console.error(`DigiKey API error for ${component.name}:`, error.response?.data || error.message);
            results.push({ name: component.name, digikey: { error: 'API Request Failed' } });
        }
    }
    
    return results;
};

module.exports = { searchDigikey };