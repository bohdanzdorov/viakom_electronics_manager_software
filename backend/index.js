const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const componentRouter = require('./src/routers/componentRouter');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/components', componentRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running normally' });
});

app.listen(port, () => {
  console.log('Server is running on port: ' + port);
});
