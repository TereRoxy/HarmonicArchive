const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const MusicSheetInstrument = sequelize.define('MusicSheetInstrument', {
  musicSheetId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'MusicSheets',
      key: 'id'
    }
  },
  instrumentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Instruments',
      key: 'id'
    }
  }
});

module.exports = MusicSheetInstrument;