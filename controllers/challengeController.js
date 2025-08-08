const { Challenge,ChallengeParticipant,User } = require("../models/index");
const moment = require('moment'); 


exports.createChallenge = async (req, res) => {
  try {
    const { title, description, start_date, end_date, created_by, goal } = req.body;

    // Validate required fields
    if (!title || !description || !start_date || !end_date, !created_by) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create challenge
    const challenge = await Challenge.create({
      title,
      goal,
      description,
      start_date,
      end_date,
      created_by,
    });

    res
      .status(201)
      .json({ message: "Challenge created successfully", data: challenge });
  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ data: challenges });
  } catch (error) {
    console.error("Fetch challenges error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActivenCompletedChallenges = async (req, res) => {
  try {
    // Fetch active and completed challenges with participants
     const challenges = await Challenge.findAll({
      where: {
        status: ['active', 'completed']
      },
      include: [
        {
          model: ChallengeParticipant,
          as: 'challengeParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'profile_pic']
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = challenges.map(challenge => {
      const participants = challenge.challengeParticipants || [];

      // Get first 4 participants
      const topParticipants = participants.slice(0, 4).map(p => ({
        id: String(p.user.id),
        image: p.user.profile_pic || '', // fallback empty string
      }));

      return {
        id: String(challenge.id),
        category: challenge.category || 'Running', // or null/default category
        title: challenge.title,
        details: challenge.description,
        date:
          challenge.status === 'active'
            ? `Active til ${moment(challenge.	end_date).format('DD MMM')}`
            : `Starts on ${moment(challenge.start_date).format('DD MMM')}`,
        startDate: moment(challenge.start_date).format('DD MMM YYYY'),
        endDate: moment(challenge.end_date).format('DD MMM YYYY'),
        goals: challenge.goal || 'N/A',
        participants: topParticipants,
        extraCount: Math.max(participants.length - 4, 0),
        status: challenge.status === 'active' ? 'ongoing' : challenge.status,

       

      };
    });

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Fetch active and completed challenges error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.updateChallenge = async (req, res) => {
  try {
    const {
      id, // Challenge ID to update
      title,
      description,
      start_date,
      end_date,
      goal,
      status,
    } = req.body;

    // Check required fields
    if (!id || !title || !description || !start_date || !end_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the challenge by ID
    const challenge = await Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Update challenge fields
    challenge.title = title;
    challenge.description = description;
    challenge.start_date = start_date;
    challenge.end_date = end_date;
    challenge.goal = goal;
    challenge.status = status;

    // Save the updated challenge
    await challenge.save();

    res.status(200).json({
      message: "Challenge updated successfully",
      data: challenge,
    });

  } catch (error) {
    console.error("Update challenge error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createChallengeParticipant = async (req, res) => {
  try {
    const { user_id, challenge_id, score } = req.body;

    // Validate input
    if (!user_id || !challenge_id) {
      return res.status(400).json({ message: "user_id and challenge_id are required",status:false });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: `Usernot found`,status:false  });
    }

    // Check if challenge exists
    const challenge = await Challenge.findByPk(challenge_id);
    if (!challenge) {
      return res.status(404).json({ message: `Challenge not found` });
    }

    // Check for duplicate entry
    const existingParticipant = await ChallengeParticipant.findOne({
      where: {
        user_id,
        challenge_id
      }
    });

    if (existingParticipant) {
      return res.status(409).json({
        message: "Participant already exists for this challenge",
        status: false
      });
    }

    // Create new participant
    const newParticipant = await ChallengeParticipant.create({
      user_id,
      challenge_id,
      score: score || 0,
    });

    res.status(201).json({
      message: "Participant added successfully",
      data: newParticipant,
      status:true
    });
  } catch (error) {
    console.error("Create participant error:", error);
    res.status(500).json({ message: "Server error" , status:false});
  
  }
};




exports.getAllUserParticipantsRanking = async (req, res) => {
  const { challengeId } = req.body;

  if (!challengeId) {
    return res.status(400).json({ message: 'challengeId is required in the body.' });
  }

  try {
    // Step 1: Check if the challenge is completed
    const challenge = await Challenge.findOne({ where: { id: challengeId, status: 'completed' } });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found or not completed.' });
    }

    // Step 2: Get all participants with user details
    const participants = await ChallengeParticipant.findAll({
      where: { challenge_id: challengeId },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'profile_pic'] }],
      order: [['score', 'DESC']]
    });

    const leaderBoard = participants.map(p => ({
      userId: p.user.id,
      name: `${p.user.firstName} ${p.user.lastName}`,
      username: p.user.username,
      email: p.user.email,
      score: p.score,
      profile_pic: p.user.profile_pic || '',
    }));

    // Step 3: Get top 3 users by score
    const topThree = leaderBoard.slice(0, 3);

    return res.status(200).json({
      leaderBoard,
      topThree,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}


exports.ChallengeWithUser = async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      attributes: ['id', 'title','start_date', 'end_date', 'status'],
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            attributes: ['score'], // Include score from ChallengeParticipant
          },
        },
      ],
    });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updateParticipantScore = async (req, res) => {
  try {
    const { challenge_id, scores } = req.body;

    if (!challenge_id || !scores || typeof scores !== 'object') {
      return res.status(400).json({
        message: 'challenge_id and scores object are required',
        status: false,
      });
    }

    const updates = Object.entries(scores).map(async ([user_id, score]) => {
      const participant = await ChallengeParticipant.findOne({
        where: { user_id, challenge_id }
      });

      if (participant) {
        participant.score = parseInt(score);
        await participant.save();
      }
    });

    await Promise.all(updates);

    return res.status(200).json({
      message: 'Scores updated successfully',
      status: true
    });
  } catch (error) {
    console.error('Bulk score update error:', error);
    res.status(500).json({ message: 'Server error', status: false });
  }
};

