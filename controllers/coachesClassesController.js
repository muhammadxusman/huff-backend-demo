const { User, CoachesClasses } = require('../models/index');

exports.assignTrainerToTrainee = async (req, res) => {
  const { trainerId, traineeId } = req.body;

  try {
    // Validate trainer and trainee roles
    const trainer = await User.findByPk(trainerId);
    const trainee = await User.findByPk(traineeId);

    if (!trainer || trainer.role !== 'trainer') {
      return res.status(400).json({ message: 'Invalid trainer ID or role' });
    }

    if (!trainee || trainee.role !== 'trainee') {
      return res.status(400).json({ message: 'Invalid trainee ID or role' });
    }

    // Prevent duplicate entry
    const existing = await CoachesClasses.findOne({
      where: { trainerId, traineeId },
    });

    if (existing) {
      return res.status(409).json({ message: 'Trainer is already assigned to this trainee' });
    }

    // Create association
    const assignment = await CoachesClasses.create({ trainerId, traineeId });

    return res.status(201).json({
      message: 'Trainer successfully assigned to trainee',
      data: assignment,
    });

  } catch (error) {
    console.error('Assignment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.findAll({
      where: { role: 'trainer' },
      attributes: { exclude: ['password'] }, // Hide password field
    });

    return res.status(200).json({
      message: 'Trainers retrieved successfully',
      data: trainers,
    });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
