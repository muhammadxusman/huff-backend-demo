const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Custom storage to separate PDFs into /nutrition
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf';

    // PDF → store in /uploads/nutrition
    if (isPdf) {
      const nutritionPath = path.join(__dirname, '..', 'uploads', 'nutrition');
      if (!fs.existsSync(nutritionPath)) {
        fs.mkdirSync(nutritionPath, { recursive: true });
      }
      cb(null, nutritionPath);
    } else {
      // Non-PDFs → store in /uploads/
      const uploadPath = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;
