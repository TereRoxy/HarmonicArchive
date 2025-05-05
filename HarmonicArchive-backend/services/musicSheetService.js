const musicSheetRepository = require('../repositories/musicSheetRepository');

exports.getAllMusicSheets = async (filters) => {
  // Add any business logic here if needed
  return await musicSheetRepository.getAll(filters);
};

exports.getMusicSheetById = async (id) => {
  const sheet = await musicSheetRepository.getById(id);
  if (!sheet) {
    throw new Error('Music sheet not found');
  }
  return sheet;
};

exports.createMusicSheet = async ({ title, composer, year, key, genres, instruments, musicFile, videoFile }) => {
  const genresArray = typeof genres === 'string' ? genres.split(',').map(g => g.trim()) : genres;
  const instrumentsArray = typeof instruments === 'string' ? instruments.split(',').map(i => i.trim()) : instruments;

  const musicFilePath = musicFile ? `/pdfs/${musicFile.filename}` : null;
  const videoFilePath = videoFile ? `/uploads/${videoFile.filename}` : null;

  const newSheet = {
    title,
    composer,
    year: parseInt(year),
    key,
    genres: genresArray,
    instruments: instrumentsArray,
    link: musicFilePath,
    videoLink: videoFilePath,
  };

  return await musicSheetRepository.create(newSheet);
};

exports.updateMusicSheet = async (id, updates) => {
  const sheet = await musicSheetRepository.getById(id);
  if (!sheet) {
    throw new Error('Music sheet not found');
  }

  // Add any validation or business logic here
  return await musicSheetRepository.update(id, updates);
};

exports.deleteMusicSheet = async (id) => {
  const sheet = await musicSheetRepository.getById(id);
  if (!sheet) {
    throw new Error('Music sheet not found');
  }

  return await musicSheetRepository.delete(id);
};