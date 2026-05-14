const axios = require('axios');

const searchMouser = async (components) => {
    const apiKey = process.env.MOUSER_API_KEY;
    
    if (!apiKey) {
        console.warn('Mouser API key is missing. Returning stubs.');
        return components.map(c => ({ name: c.name, mouser: { error: 'API key missing' } }));
    }

    const results = [];
    
    // Process sequentially to avoid hitting rate limits too quickly.
    // For production, you might want to batched/chunked requests if the API supports it.
    for (const component of components) {
        try {
            const response = await axios.post(
                `https://api.mouser.com/api/v1/search/keyword?apiKey=${apiKey}`,
                {
                    SearchByKeywordRequest: {
                        keyword: component.name,
                        records: 1,
                        startingRecord: 0,
                        searchOptions: 1,
                        searchWithYourSignUpLanguage: ''
                    }
                }
            );

            const parts = response.data?.SearchResults?.Parts || [];
            if (parts.length > 0) {
                const part = parts[0];
                
                let price = 'N/A';
                if (part.PriceBreaks && part.PriceBreaks.length > 0) {
                    const requestedQty = component.quantity || 1;
                    let bestPrice = part.PriceBreaks[0].Price;
                    
                    for (const priceBreak of part.PriceBreaks) {
                        if (requestedQty >= priceBreak.Quantity) {
                            bestPrice = priceBreak.Price;
                        }
                    }
                    price = bestPrice;
                }

                results.push({
                    name: component.name,
                    mouser: {
                        inStock: part.Availability ? part.Availability.replace(/\D/g, '') || '0' : '0',
                        price: price,
                        url: part.ProductDetailUrl || 'N/A',
                        manufacturer: part.Manufacturer || 'N/A'
                    }
                });
            } else {
                results.push({ name: component.name, mouser: { inStock: '0', price: 'N/A', error: 'Not found' } });
            }
        } catch (error) {
            console.error(`Mouser API error for ${component.name}:`, error.message);
            results.push({ name: component.name, mouser: { error: 'API Request Failed' } });
        }
    }
    return results;
};

module.exports = { searchMouser };
