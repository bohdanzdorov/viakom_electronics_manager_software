const fs = require('fs');
const path = require('path');

const rateFilePath = path.join(__dirname, '../../exchange-rate.json');

const fetchRateFromNBU = async () => {
  try {
    // NBU API endpoint for USD to UAH
    const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    if (data && data.length > 0) {
      const rateData = {
        rate: data[0].rate,
        date: data[0].exchangedate,
        updatedAt: new Date().toISOString()
      };
      // Cache the rate locally
      fs.writeFileSync(rateFilePath, JSON.stringify(rateData, null, 2), 'utf8');
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
    if (!fs.existsSync(rateFilePath)) {
      const newRate = await fetchRateFromNBU();
      if (newRate) {
        return res.status(200).json(newRate);
      } else {
        return res.status(200).json({ rate: 40.0, date: "Default (Error fetching)" }); // Fallback
      }
    }
    const data = fs.readFileSync(rateFilePath, 'utf8');
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading exchange rate:', error);
    res.status(500).json({ message: 'Failed to read exchange rate' });
  }
};

module.exports = {
  getExchangeRate,
  fetchRateFromNBU
};