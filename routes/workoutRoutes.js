const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const workoutController = require('../controllers/workoutController');

router.post(
  '/workouts',
  upload.fields([
    { name: 'thumbnail_img', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]),
  workoutController.createWorkout
);

router.get('/get-all-workouts', workoutController.getAllWorkouts);
router.put(
  '/update-workout',
  upload.fields([
    { name: 'thumbnail_img', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]),
  workoutController.updateWorkout
);
router.post('/play-track', workoutController.playTrack);
router.post('/end-track', workoutController.endTrack);
router.post('/create-user-workout-plan', workoutController.UserWorkoutManagements);

router.get('/workout-managements', workoutController.getAllWorkoutManagements);
router.post('/workout-managements-custom', workoutController.UserWorkoutManagements_custom);

router.put('/update-workout-managements', workoutController.updateWorkoutManagementById);


module.exports = router;
