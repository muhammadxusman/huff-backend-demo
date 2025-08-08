'use strict';

const { Workout, sequelize } = require('../models'); // Make sure ../models/index.js exports both Workout and sequelize
const data = require('../data/workout_data.json');
const { Sequelize } = require('sequelize');

function extractWorkouts(jsonData) {
  const workouts = [];

  for (const categoryBlock of jsonData) {
    for (const category in categoryBlock) {
      const exercises = categoryBlock[category];

      for (const exercise of exercises) {
        for (const name in exercise) {
          const details = exercise[name];

          workouts.push({
  category,
  name,
  short_description: details.short_description,
  duration: details.duration || null,
  rest_time: details.rest_time || null,
  number_of_exercises: details.number_of_exercises || null,
  overview: details.overview || null,
  how_to_perform: details.how_to_perform ? JSON.stringify(details.how_to_perform) : null,
  sets_reps: details.sets_reps ? JSON.stringify(details.sets_reps) : null,
  thumbnail_img: details.thumbnail_img || null,
  gallery_images: details.gallery_images ? JSON.stringify(details.gallery_images) : null,
  createdAt: new Date(),
  updatedAt: new Date()
});

        }
      }
    }
  }

  return workouts;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Seeding workouts...');
    const workouts = extractWorkouts(data);
    await queryInterface.bulkInsert('workouts', workouts, {});
    console.log('✅ Workout seed complete.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('workouts', null, {});
    console.log('🗑️ Workout seed reverted.');
  }
};

// Run directly with `node seeders/workoutseeder.js`
if (require.main === module) {
  // ✅ Fix: use `sequelize` directly from models/index.js
  const queryInterface = sequelize.getQueryInterface();

  module.exports.up(queryInterface, Sequelize)
    .then(() => {
      console.log('✅ Workouts seeded successfully via direct run!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error seeding workouts:', err);
      process.exit(1);
    });
}
