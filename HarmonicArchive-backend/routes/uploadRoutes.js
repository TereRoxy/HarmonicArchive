const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const uploadService = require('../services/uploadService');

router.post('/video/start', uploadController.startUpload);
router.post('/video/chunk', uploadService.chunkUpload.single('chunk'), uploadController.uploadChunk);
router.post('/video/complete', uploadController.completeUpload);

module.exports = router;