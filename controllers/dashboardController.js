const { User, Workout ,ChallengeParticipant, NutritionPlan} = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    // Count total workout plans
    const totalWorkouts = await Workout.count();

    // Count total users
    const totalUsers = await User.count();

    const totalNutritionPlans = await NutritionPlan.count();

    // Count total challenges
    const totalChallenges = await ChallengeParticipant.count();

    res.json({
      totalWorkouts,
      totalUsers,
      totalChallenges,
      totalNutritionPlans,
        });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
};
