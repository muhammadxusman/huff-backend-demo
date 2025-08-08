// models/challenge.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  goal: {
    type: DataTypes.STRING,
    allowNull: true, // Nullable by default
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active',
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'challenges',
});

Challenge.associate = (models) => {
  // Users who joined the challenge
  Challenge.belongsToMany(models.User, {
    through: models.ChallengeParticipant,
    foreignKey: 'challenge_id',
    as: 'participants',
  });
  Challenge.hasMany(models.ChallengeParticipant, {
    foreignKey: 'challenge_id',
    as: 'challengeParticipants', // ✅ different alias
  });

  // User who created the challenge
  Challenge.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
};


module.exports = Challenge;
