const { Workout, WorkoutManagement,User } = require('../models');
const { sendPushNotification } = require('../services/notificationService');

exports.createWorkout = async (req, res) => {
  try {
    const {
      category,
      name,
      short_description,
      duration,
      rest_time,
      number_of_exercises,
      overview,
      how_to_perform,
      sets_reps
    } = req.body;

    // Use filename instead of full path
    const thumbnailFilename = req.files?.thumbnail_img?.[0]?.filename || '';
    const galleryFilenames = req.files?.gallery_images?.map((file) => file.filename) || [];

    const newWorkout = await Workout.create({
      category,
      name,
      short_description,
      duration,
      rest_time,
      number_of_exercises,
      overview,
      how_to_perform: JSON.parse(how_to_perform),
      sets_reps: JSON.parse(sets_reps),
      thumbnail_img: thumbnailFilename,   // Just the filename
      gallery_images: galleryFilenames    // Array of filenames
    });

    res.status(201).json({ message: 'Workout created successfully', data: newWorkout });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
};

// exports.UserWorkoutManagements = async (req, res) => {
//   try {
//     const {
//       workout_id,
//       trainee_id,
//       assign_by,
//       status,
//       start_date,
//       end_date,
//       weekdays, // Expected as array like ['Monday', 'Wednesday']
//     } = req.body;

//     const newWorkoutManagement = await WorkoutManagement.create({
//       workout_id,
//       trainee_id,
//       assign_by,
//       status,
//       start_date,
//       end_date,
//       weekdays,
//     });
//     const workout = await Workout.findByPk(workout_id);
//     const user = await User.findByPk(trainee_id);
//     sendPushNotification(user.fcm_token, "Workout Assigned", `You have been assigned a new workout: ${workout.name} and category: ${workout.category} | Schedule: ${weekdays.join(', ')}  from ${start_date} to ${end_date}`);

//     res.status(201).json({
//       message: 'Workout management created successfully',
//       data: newWorkoutManagement,
//     });
//   } catch (error) {
//     console.error('Error creating workout management:', error);
//     res.status(500).json({ error: 'Failed to create workout management' });
//   }
// };
exports.UserWorkoutManagements = async (req, res) => {
  try {
    const {
      workout_id,
      trainee_id,
      assign_by,
      status,
      start_date,
      end_date,
      weekdays, // Expected as array like ['Monday', 'Wednesday']
    } = req.body;
    const newWorkoutManagement = await WorkoutManagement.create({
      workout_id,
      trainee_id,
      assign_by,
      status,
      start_date,
      end_date,
      weekdays,
    });
    const workout = await Workout.findByPk(workout_id);
    const user = await User.findByPk(trainee_id);
    let UserNotification;
    if (user && user.fcm_token) {
     UserNotification =  await  sendPushNotification(user.fcm_token, "Workout Assigned", `You have been assigned a new workout: ${workout.name} and category: ${workout.category} | Schedule: ${weekdays.join(', ')}  from ${start_date} to ${end_date}`);
  }
    res.status(201).json({
      message: 'Workout management created successfully',
      data: newWorkoutManagement,
      notificationResponseForMobile : UserNotification
    });
  } catch (error) {
    console.error('Error creating workout management:', error);
    res.status(500).json({ error: 'Failed to create workout management' });
  }
};

exports.UserWorkoutManagements_custom = async (req, res) => {

  console.log("Creating custom workout management with data:", req.body);
  try {
    const {
      workout_id,
      trainee_id,
      status,
      start_date,
      end_date,
      weekdays, // Expected as array like ['Monday', 'Wednesday']
    } = req.body;
    const newWorkoutManagement = await WorkoutManagement.create({
      workout_id,
      trainee_id,
      assign_by: trainee_id,
      status,
      start_date,
      end_date,
      weekdays,
    });
    const workout = await Workout.findByPk(workout_id);
    const user = await User.findByPk(trainee_id);
   
    res.status(201).json({
      message: 'Workout management created successfully',
      data: newWorkoutManagement,
    });
  } catch (error) {
    console.error('Error creating workout management:', error);
    res.status(500).json({ error: 'Failed to create workout management' });
  }
};




exports.getAllWorkoutManagements = async (req, res) => {
  try {
    const workoutManagements = await WorkoutManagement.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'trainee',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Workout,
          as: 'workout',
          attributes: ['id', 'name']
        }
      ]
    });

    // Format the response to replace IDs with names
    const formattedData = workoutManagements.map((wm) => ({
      id: wm.id,
      workout: wm.workout?.name || null,
      trainee: wm.trainee ? `${wm.trainee.firstName} ${wm.trainee.lastName}` : null,
      trainer: wm.trainer ? `${wm.trainer.firstName} ${wm.trainer.lastName}` : null,
      start_date: wm.start_date,
      end_date: wm.end_date,
      weekdays: wm.weekdays,
      status: wm.status,
      createdAt: wm.createdAt,
      updatedAt: wm.updatedAt
    }));

    res.json({
      message: 'Workout management records fetched successfully',
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching workout management records:', error);
    res.status(500).json({ error: 'Failed to fetch workout management records' });
  }
};

exports.updateWorkoutManagementById = async (req, res) => {
  try {
    const {
      id,
      workout_id,
      trainee_id,
      assign_by,
      status,
      start_date,
      end_date,
      weekdays,
    } = req.body;

    // Basic validation for required fields
    if (!id) return res.status(400).json({ error: "Invalid request. Please try again." });
    if (!workout_id) return res.status(400).json({ error: "Please select a workout." });
    if (!trainee_id) return res.status(400).json({ error: "Please select a trainee." });
    if (!assign_by) return res.status(400).json({ error: "Please select a trainer." });
    if (!status) return res.status(400).json({ error: "Please choose a status." });
    if (!start_date || !end_date) return res.status(400).json({ error: "Start and end dates are required." });

    // Validate date format and order
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Please enter valid dates." });
    }
    if (start > end) {
      return res.status(400).json({ error: "Start date cannot be after end date." });
    }

    // Weekdays validation
    if (!Array.isArray(weekdays)) {
      return res.status(400).json({ error: "Please select the workout days." });
    }

    // Find the existing plan
    const workoutManagement = await WorkoutManagement.findByPk(id);
    if (!workoutManagement) {
      return res.status(404).json({ error: "This workout plan could not be found." });
    }

    // Update the plan
    await workoutManagement.update({
      workout_id,
      trainee_id,
      assign_by,
      status,
      start_date,
      end_date,
      weekdays,
    });

    return res.status(200).json({
      message: "Workout plan updated successfully.",
      data: workoutManagement,
    });

  } catch (error) {
    console.error("Error updating workout management:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Some values are invalid. Please check your inputs." });
    }

    return res.status(500).json({
      error: "Something went wrong while updating the plan. Please try again later.",
    });
  }
};
        


exports.getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(workouts);
  } catch (err) {
    console.error('Error fetching workouts:', err);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
};
exports.endTrack = async (req, res) => {
  try {
    const { workout_id, user_id } = req.body;
    const end_time = new Date();

    // Update the WorkoutManagement record with end_time
    await WorkoutManagement.update(
      { end_time, status: 'completed' }, // Assuming you want to mark it as completed
      { where: { workout_id, trainee_id: user_id } }
    );

    // You might want to save this end event in a PlayHistory table
    res.status(200).json({
      message: 'Track play ended',
      workout_id,
      user_id,
      end_time
    });
  } catch (error) {
    console.error('Error ending track play:', error);
    res.status(500).json({ error: 'Failed to end track play' });
  }
};
exports.playTrack = async (req, res) => {
  try {
    const { workout_id, user_id } = req.body;
    const start_time = new Date();


    // Find the latest record first
    const track = await WorkoutManagement.findOne({
      where: { workout_id, trainee_id: user_id },
      order: [['start_time', 'DESC']]
    });
    if (!track) {
      return res.status(404).json({ error: 'No workout management found for this user and workout' });
    }

    let track_id = null;
    if (track) {
      await track.update({
      start_time,
      status: 'in_progress', // Assuming you want to mark it as in progress
      number_of_replays: (track.number_of_replays || 0) + 1
      });
      track_id = track.id;
     
    }
  return res.status(200).json({
      message: 'Track play started',
      workout_id, 
      track_id,
      user_id,
      start_time
    });
    // You might want to save this play event in a PlayHistory table
    // For now, just respond with the start_time
  
  } catch (error) {
    console.error('Error starting track play:', error);
    res.status(500).json({ error: 'Failed to start track play' });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const {
      id,
      category,
      name,
      short_description,
      duration,
      rest_time,
      number_of_exercises,
      overview,
      how_to_perform,
      sets_reps
    } = req.body;

    const workout = await Workout.findByPk(id);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Use filename if new file uploaded, otherwise use existing from DB
    const thumbnailFilename =
      req.files?.thumbnail_img?.[0]?.filename || workout.thumbnail_img;

    const galleryFilenames =
      req.files?.gallery_images?.length
        ? req.files.gallery_images.map((file) => file.filename)
        : workout.gallery_images || [];

    await workout.update({
      category,
      name,
      short_description,
      duration,
      rest_time,
      number_of_exercises,
      overview,
      how_to_perform:
        typeof how_to_perform === 'string' ? JSON.parse(how_to_perform) : how_to_perform,
      sets_reps:
        typeof sets_reps === 'string' ? JSON.parse(sets_reps) : sets_reps,
      thumbnail_img: thumbnailFilename,
      gallery_images: galleryFilenames
    });

    res.json({ message: 'Workout updated successfully', data: workout });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
};
