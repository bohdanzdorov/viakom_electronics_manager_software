const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { uploadAndSearch, exportData } = require('../controllers/componentController');

// Ensure uploads directory exists for cloud deployments (like Render)
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadAndSearch);
router.post('/export', exportData);

module.exports = router;
