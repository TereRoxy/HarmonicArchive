const generationService = require('../services/generationService');

exports.toggleGeneration = (req, res) => {
  const { active, interval } = req.body;
  
  if (active) {
    generationService.startGenerating(interval);
  } else {
    generationService.stopGenerating();
  }
  
  res.json({ success: true, isGenerating: generationService.isGenerating });
};

exports.getGenerationStatus = (req, res) => {
  res.json({ isGenerating: generationService.isGenerating });
};