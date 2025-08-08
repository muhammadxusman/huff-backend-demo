const { sequelize } = require('../config/db');

const User = require('./User');
const CoachesClasses = require('./coachesClasses');
const Workout = require('./workout');
const WorkoutManagement = require('./workoutManagement');

// ✅ Add these two lines:
const Challenge = require('./challenge');
const ChallengeParticipant = require('./challengeParticipant');

const ContactForm = require('./contactForm');

const Notification = require('./notification');

const faq = require('./faq');
const NutritionPlan = require('./nutritionPlan');
const AssignNutritionPlan = require('./assignNutritionPlan');

// Register all models
const models = {
  User,
  CoachesClasses,
  Workout,
  WorkoutManagement,
  Challenge,                
  ChallengeParticipant,     
  faq,
  Notification,
  ContactForm,
  NutritionPlan,
  AssignNutritionPlan,
};

// Call associate if defined
Object.keys(models).forEach((modelName) => {
  if (typeof models[modelName].associate === 'function') {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
