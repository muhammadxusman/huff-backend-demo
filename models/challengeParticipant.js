// models/challengeParticipant.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChallengeParticipant = sequelize.define('ChallengeParticipant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  challenge_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'challenges',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'participants',
});

ChallengeParticipant.associate = (models) => {
  ChallengeParticipant.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  ChallengeParticipant.belongsTo(models.Challenge, {
    foreignKey: 'challenge_id',
    as: 'challenge',
  });
};



module.exports = ChallengeParticipant;
