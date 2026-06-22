import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure storage parameters
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'IMAGES/';
    // Ensure destination directory exists recursively
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique naming with original extension
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

// Configure Multer limits and filters
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, gif, webp) are allowed!'));
  }
});

// POST /api/upload - Handle image file uploads
router.post('/', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer uploading error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file!' });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Image uploaded successfully!',
      filePath: `/IMAGES/${req.file.filename}`,
      originalName: req.file.originalname,
      sizeBytes: req.file.size
    });
  });
});

export default router;
