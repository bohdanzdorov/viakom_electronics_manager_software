const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadAndSearch, exportData } = require('../controllers/componentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadAndSearch);
router.post('/export', exportData);

module.exports = router;
