const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkoutManagement = sequelize.define('WorkoutManagement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  workout_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workouts',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  trainee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  assign_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  weekdays: {
    type: DataTypes.JSON, // Store array as JSON
    allowNull: true,
    // comment: "Array of weekdays (e.g. ['Monday', 'Wednesday'])",
  },
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'completed'),
    allowNull: false,
    defaultValue: 'assigned',
  },
  number_of_replays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    // comment: "Number of times the workout is repeated"
  }
}, {
  timestamps: true,
  tableName: 'workout_managements',
});

WorkoutManagement.associate = (models) => {
  WorkoutManagement.belongsTo(models.User, {
    foreignKey: 'trainee_id',
    as: 'trainee',
  });

  WorkoutManagement.belongsTo(models.User, {
    foreignKey: 'assign_by',
    as: 'trainer',
  });

  WorkoutManagement.belongsTo(models.Workout, {
    foreignKey: 'workout_id',
    as: 'workout',
  });
};

module.exports = WorkoutManagement;
