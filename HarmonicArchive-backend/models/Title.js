const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const Title = sequelize.define('Title', {
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

module.exports = Title;