const express = require('express');
const router = express.Router();
const musicSheetController = require('../controllers/musicSheetController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.mimetype === 'application/pdf' ? 
      path.join(__dirname, '../public/pdfs') : 
      path.join(__dirname, '../uploads');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/', musicSheetController.getAllMusicSheets);
router.get('/:id', musicSheetController.getMusicSheetById);
router.post('/', upload.fields([{ name: 'musicFile', maxCount: 1 }, { name: 'videoFile', maxCount: 1 }]), musicSheetController.createMusicSheet);
router.patch('/:id', musicSheetController.updateMusicSheet);
router.delete('/:id', musicSheetController.deleteMusicSheet);

module.exports = router;