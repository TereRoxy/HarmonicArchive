const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const MusicSheetGenre = sequelize.define('MusicSheetGenre', {
  musicSheetId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'MusicSheets',
      key: 'id'
    }
  },
  genreId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Genres',
      key: 'id'
    }
  }
});

module.exports = MusicSheetGenre;