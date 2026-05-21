const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const componentRouter = require('./src/routers/componentRouter');
const coeffRouter = require('./src/routers/coeffRouter');
const exchangeRateRouter = require('./src/routers/exchangeRateRouter');
const { fetchRateFromNBU } = require('./src/controllers/exchangeRateController');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/components', componentRouter);
app.use('/api/coefficients', coeffRouter);
app.use('/api/exchange-rate', exchangeRateRouter);

// Schedule fetching NBU exchange rates every day at 16:00 Kyiv time
cron.schedule('0 16 * * *', () => {
  console.log('Running scheduled daily NBU exchange rate fetch (16:00 Kyiv time)');
  fetchRateFromNBU();
}, {
  scheduled: true,
  timezone: "Europe/Kyiv"
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running normally' });
});

app.listen(port, () => {
  console.log('Server is running on port: ' + port);
});
