let cachedRate = null;
let lastFetchDate = null; 

const fetchRateFromNBU = async () => {
  try {
    const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    if (data && data.length > 0) {
      const rateData = {
        rate: data[0].rate,
        date: data[0].exchangedate,
        updatedAt: new Date().toISOString()
      };
      
      // Save it to RAM instead of a file
      cachedRate = rateData;
      // Store today's date (Kyiv time) so we know when to fetch again tomorrow
      lastFetchDate = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Kyiv" }); 
      
      console.log('Exchange rate updated successfully from NBU:', rateData.rate);
      return rateData;
    }
  } catch (error) {
    console.error('Error fetching exchange rate from NBU:', error);
  }
  return null;
};

const getExchangeRate = async (req, res) => {
  try {
    const todayInKyiv = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Kyiv" });
    
    // If we don't have a rate yet, OR if the date has changed to a new day in Kyiv, fetch a new one!
    if (!cachedRate || lastFetchDate !== todayInKyiv) {
      console.log('Fetching fresh rate for:', todayInKyiv);
      const newRate = await fetchRateFromNBU();
      
      if (newRate) {
        return res.status(200).json(newRate);
      } else if (cachedRate) {
        // If NBU is down, but we have yesterday's rate in RAM, return that as a fallback
        return res.status(200).json(cachedRate); 
      } else {
        // Ultimate fallback if it's the first boot and NBU is entirely down
        return res.status(200).json({ rate: 40.0, date: "Default (Error fetching)" }); 
      }
    }
    
    // If we already fetched it today, return the cached version from RAM instantly
    res.status(200).json(cachedRate);

  } catch (error) {
    console.error('Error in getExchangeRate:', error);
    res.status(500).json({ message: 'Failed to handle exchange rate' });
  }
};

module.exports = {
  getExchangeRate,
  fetchRateFromNBU
};