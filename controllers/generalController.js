const {ContactForm,User,ChallengeParticipant,Workout,WorkoutManagement,Challenge , NutritionPlan, AssignNutritionPlan } = require('../models/index');
const { Op } = require("sequelize");
const moment = require('moment'); // or use JS Date

exports.createContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create the new contact form entry
        const newContactForm = await ContactForm.create({ name, email, message });

        return res.status(201).json({success: true, message: 'Contact form submitted successfully', data: newContactForm});
    } catch (error) {
        console.error('Error creating contact form:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
    

// Fetch all contact form entries
exports.getAllContactForms = async (req, res) => {
    try {
        const contactForms = await ContactForm.findAll();

        return res.status(200).json({
            success: true,
            message: 'Contact forms retrieved successfully',
            data: contactForms
        });
    } catch (error) {
        console.error('Error fetching contact forms:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.updateNotificationPreference = async (req, res) => {
  try {
    const { userId, is_allowed_notification } = req.body;

    if (typeof userId === 'undefined' || typeof is_allowed_notification === 'undefined') {
      return res.status(400).json({ message: "userId and is_allowed_notification are required." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.update({ is_allowed_notification });

    return res.status(200).json({ message: "Notification preference updated successfully." });
  } catch (error) {
    console.error("Update notification error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};



exports.updateContactFormReadStatus = async (req, res) => {
  try {
    const { id, is_read } = req.body;

    if (typeof id === 'undefined' || typeof is_read === 'undefined') {
      return res.status(400).json({ message: 'id and is_read are required.' });
    }

    const contactForm = await ContactForm.findByPk(id);

    if (!contactForm) {
      return res.status(404).json({ message: 'Contact form entry not found.' });
    }

    await contactForm.update({ is_read });

    return res.status(200).json({ 
      success: true, 
      message: 'Contact form read status updated successfully.',
      data: contactForm
    });
  } catch (error) {
    console.error('Error updating is_read status:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


exports.getPlanOrWorkoutStats = async (req, res) => {
  const { type = "workout", range = "week" } = req.body;
  const now = new Date();
  let startDate;

  if (range === "day") {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (range === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "month") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    return res.status(400).json({ message: "Invalid range" });
  }

  try {
    let records;

    if (type === "workout") {
      records = await WorkoutManagement.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, now],
          },
        },
      });
    } else if (type === "nutrition") {
      records = await NutritionPlan.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, now],
          },
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    const dailyCounts = {};

    records.forEach((item) => {
      const date = new Date(
        type === "workout" ? item.createdAt : item.created_at
      )
        .toISOString()
        .split("T")[0];

      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const length = range === "day" ? 24 : range === "week" ? 7 : 30;

    const data = Array.from({ length }, (_, i) => {
      const date =
        range === "day"
          ? new Date(startDate.getTime() + i * 60 * 60 * 1000)
          : new Date(now.getTime() - (length - 1 - i) * 24 * 60 * 60 * 1000);

      const label =
        range === "day"
          ? `${date.getHours()}:00`
          : date.toISOString().split("T")[0];

      return {
        time: label,
        count: dailyCounts[label] || 0,
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};





exports.getAggregateUserProgress = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required'});
  }

  try {
    const currentDate = moment();

    // ---------- Challenge Progress ----------
    const challengeData = await ChallengeParticipant.findAll({
      where: { user_id: userId },
      include: [{ model: Challenge, as: 'challenge' }],
    });

    let totalChallengeProgress = 0;
    let challengeCount = 0;

    for (const item of challengeData) {
      const start = item.challenge?.start_date ? moment(item.challenge.start_date) : null;
      const end = item.challenge?.end_date ? moment(item.challenge.end_date) : null;

      let progress = 0;

      if (start && end && end.isAfter(start)) {
        if (currentDate.isSameOrBefore(start)) progress = 0;
        else if (currentDate.isSameOrAfter(end)) progress = 100;
        else {
          const total = end.diff(start, 'days');
          const done = currentDate.diff(start, 'days');
          progress = (done / total) * 100;
        }
        totalChallengeProgress += progress;
        challengeCount += 1;
      }
    }

    // ---------- Workout Progress ----------
    const workoutData = await WorkoutManagement.findAll({
      where: { trainee_id: userId },
      include: [{ model: Workout, as: 'workout' }],
    });

    let totalWorkoutProgress = 0;
    let workoutCount = 0;

    for (const item of workoutData) {
      const start = item.start_date ? moment(item.start_date) : null;
      const end = item.end_date ? moment(item.end_date) : null;

      let progress = 0;

      if (start && end && end.isAfter(start)) {
        if (currentDate.isSameOrBefore(start)) progress = 0;
        else if (currentDate.isSameOrAfter(end)) progress = 100;
        else {
          const total = end.diff(start, 'days');
          const done = currentDate.diff(start, 'days');
          progress = (done / total) * 100;
        }
        totalWorkoutProgress += progress;
        workoutCount += 1;
      }
    }

    const totalItems = challengeCount + workoutCount;
    const totalProgress = totalItems > 0
      ? ((totalChallengeProgress + totalWorkoutProgress) / totalItems)
      : 0;

    // ---------- Nutrition Plan Check ----------
    const assignedNutrition = await AssignNutritionPlan.findOne({
      where: { trainee_id: userId },
      include: [
        {
          model: NutritionPlan,
          as: 'nutritionPlan',
          attributes: ['plan_name'],
        },
      ],
      order: [['assigned_at', 'DESC']],
    });

    const hasNutritionPlan = !!assignedNutrition;
    const nutritionPlanInfo = hasNutritionPlan
      ? {
          hasNutritionPlan: true,
          planName: assignedNutrition.nutritionPlan?.plan_name || 'Unnamed Plan',
          assignedAt: assignedNutrition.assigned_at,
        }
      : { hasNutritionPlan: false };

    // ---------- Response ----------
    return res.json({
      success: true,
      data: {
        userId,
        totalProgress: parseFloat(totalProgress.toFixed(2)),
        breakdown: {
          challengeCount,
          workoutCount,
          totalChallengeProgress: parseFloat(totalChallengeProgress.toFixed(2)),
          totalWorkoutProgress: parseFloat(totalWorkoutProgress.toFixed(2)),
        },
        nutritionPlan: nutritionPlanInfo,
      },
    });

  } catch (error) {
    console.error('Error in getAggregateUserProgress:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

