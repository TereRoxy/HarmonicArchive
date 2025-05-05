const express = require('express');
const router = express.Router();
const generationController = require('../controllers/generationController');

router.post('/', generationController.toggleGeneration);
router.get('/status', generationController.getGenerationStatus);

module.exports = router;