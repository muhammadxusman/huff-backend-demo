const express = require('express');
const router = express.Router();
const {createChallenge,getAllChallenges,updateChallenge,createChallengeParticipant,getActivenCompletedChallenges,getAllUserParticipantsRanking,ChallengeWithUser,
    updateParticipantScore} = require('../controllers/challengeController');

router.post('/create-challenge', createChallenge);
router.get('/get-challenge', getAllChallenges);
router.get('/get-active-completed-challenges', getActivenCompletedChallenges);
router.put('/update-challenge', updateChallenge);
router.post('/create-challenge-participant', createChallengeParticipant);
router.post('/get-user-participants-ranking', getAllUserParticipantsRanking);
router.get('/get-challenges-with-users', ChallengeWithUser); // Fetch challenge with user details
router.post('/update-participant-score', updateParticipantScore); // Update participant score

module.exports = router;