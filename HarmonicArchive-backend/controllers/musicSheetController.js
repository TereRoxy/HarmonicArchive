const musicSheetService = require('../services/musicSheetService');

exports.getAllMusicSheets = async (req, res) => {
  try {
    const filters = req.query;
    const result = await musicSheetService.getAllMusicSheets(filters);
    res.json(result);
  } catch (error) {
    console.error('Error in getAllMusicSheets:', error);
    res.status(500).json({ error: 'Failed to fetch music sheets' });
  }
};

exports.getMusicSheetById = async (req, res) => {
  try {
    const id = req.params.id;
    const sheet = await musicSheetService.getMusicSheetById(id);
    res.json(sheet);
  } catch (error) {
    console.error('Error in getMusicSheetById:', error);
    res.status(404).json({ error: 'Music sheet not found' });
  }
};

exports.createMusicSheet = async (req, res) => {
  try {
    const newSheet = await musicSheetService.createMusicSheet(req.body);
    res.status(201).json(newSheet);
  } catch (error) {
    console.error('Error in createMusicSheet:', error);
    res.status(500).json({ error: 'Failed to create music sheet' });
  }
};

exports.updateMusicSheet = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const updatedSheet = await musicSheetService.updateMusicSheet(id, updates);
    res.json(updatedSheet);
  } catch (error) {
    console.error('Error in updateMusicSheet:', error);
    res.status(404).json({ error: 'Music sheet not found' });
  }
};

exports.deleteMusicSheet = async (req, res) => {
  try {
    const id = req.params.id;
    await musicSheetService.deleteMusicSheet(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteMusicSheet:', error);
    res.status(404).json({ error: 'Music sheet not found' });
  }
};