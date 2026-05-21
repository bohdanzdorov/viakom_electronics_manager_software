const fs = require('fs');
const path = require('path');

const coeffFilePath = path.join(__dirname, '../../coefficients.json');

const getCoefficients = (req, res) => {
  try {
    if (!fs.existsSync(coeffFilePath)) {
      return res.status(200).json({ mouser: 1.5, tme: 1.5, digikey: 1.5 });
    }
    const data = fs.readFileSync(coeffFilePath, 'utf8');
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading coefficients:', error);
    res.status(500).json({ message: 'Failed to read coefficients' });
  }
};

const updateCoefficients = (req, res) => {
  try {
    const newCoeffs = req.body;
    fs.writeFileSync(coeffFilePath, JSON.stringify(newCoeffs, null, 2), 'utf8');
    res.status(200).json({ message: 'Coefficients updated successfully', coefficients: newCoeffs });
  } catch (error) {
    console.error('Error writing coefficients:', error);
    res.status(500).json({ message: 'Failed to update coefficients' });
  }
};

module.exports = {
  getCoefficients,
  updateCoefficients
};