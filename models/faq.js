const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Faq = sequelize.define('faq', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'faqs',
});

module.exports = Faq;


