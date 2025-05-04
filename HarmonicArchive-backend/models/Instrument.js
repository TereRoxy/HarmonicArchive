const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const Instrument = sequelize.define('Instrument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Instrument;