const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const Composer = sequelize.define('Composer', {
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

module.exports = Composer;