const MusicSheet = require('../models/MusicSheet'); // Import the Sequelize model
const { Op } = require('sequelize');

const musicSheetRepository = {
  async getAll({ page, limit, sort, order, genres, instruments, query }) {
    const where = {};

    // Apply filters
    if (query) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { composer: { [Op.like]: `%${query}%` } },
      ];
    }

    if (genres) {
      where.genres = { [Op.contains]: genres.split(',').map(g => g.trim()) };
    }

    if (instruments) {
      where.instruments = { [Op.contains]: instruments.split(',').map(i => i.trim()) };
    }

    // Fetch data with pagination and sorting
    const offset = (page - 1) * limit;
    const result = await MusicSheet.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset,
    });

    return {
      total: result.count,
      data: result.rows,
    };
  },

  async getById(id) {
    return await MusicSheet.findByPk(id);
  },

  async create(data) {
    return await MusicSheet.create(data);
  },

  async update(id, updates) {
    const sheet = await MusicSheet.findByPk(id);
    if (!sheet) return null;
    return await sheet.update(updates);
  },

  async delete(id) {
    const sheet = await MusicSheet.findByPk(id);
    if (!sheet) return false;
    await sheet.destroy();
    return true;
  },
};

module.exports = musicSheetRepository;