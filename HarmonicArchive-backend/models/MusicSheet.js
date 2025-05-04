const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const MusicSheet = sequelize.define('MusicSheet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  musicFilePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  videoFilePath: {
    type: DataTypes.STRING
  }
});

module.exports = MusicSheet;