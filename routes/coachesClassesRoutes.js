const express = require('express');
const router = express.Router();
const {getAllTrainers, assignTrainerToTrainee} = require('../controllers/coachesClassesController');

// POST: Assign trainer to trainee
router.post('/coachesClasses', assignTrainerToTrainee);
router.get('/getTrainers', getAllTrainers);
module.exports = router;
