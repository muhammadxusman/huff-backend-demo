const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Workout = sequelize.define('Workout', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING, // e.g., "CHEST EXERCISES"
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING, // e.g., "Inclined Bench Press"
    allowNull: false,
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING, // e.g., "30–40 min"
    allowNull: true,
  },
  rest_time: {
    type: DataTypes.STRING, // e.g., "60–90 sec"
    allowNull: true,
  },
  number_of_exercises: {
    type: DataTypes.STRING, // e.g., "8-12"
    allowNull: true,
  },
  overview: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  how_to_perform: {
    type: DataTypes.JSON, // { start_position: [], execution: [] }
    allowNull: true,
  },
  sets_reps: {
    type: DataTypes.JSON, // { beginners: "", intermediate: "", advanced: "" }
    allowNull: true,
  },
  thumbnail_img: {
    type: DataTypes.STRING, // URL of single image
    allowNull: true,
  },
  gallery_images: {
    type: DataTypes.JSON, // Array of image URLs
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'workouts',
});

module.exports = Workout;
