const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const componentRouter = require('./src/routers/componentRouter');
const coeffRouter = require('./src/routers/coeffRouter');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/components', componentRouter);
app.use('/api/coefficients', coeffRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running normally' });
});

app.listen(port, () => {
  console.log('Server is running on port: ' + port);
});
