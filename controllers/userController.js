const {
  User,
  CoachesClasses,
  Workout,
  Challenge,
  WorkoutManagement,
  ChallengeParticipant,
} = require("../models/index");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const moment = require("moment");
const Sequelize = require("sequelize");

exports.getUserWorkoutChallenges = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ error: "user_id is required in the request body." });
  }

  try {
    // Fetch challenges joined by the user
    // STEP 1: Get all challenge_ids where the user is a participant
    const userChallengeIds = await ChallengeParticipant.findAll({
      where: { user_id },
      attributes: ["challenge_id"],
    });

    const challengeIds = userChallengeIds.map((row) => row.challenge_id);

    // STEP 2: Fetch those challenges, including ALL participants with user details
    const challenges = await Challenge.findAll({
      where: {
        id: {
          [Op.in]: challengeIds,
        },
        status: {
          [Op.ne]: "inactive", // Exclude inactive challenges
        },
      },
      include: [
        {
          model: ChallengeParticipant,
          as: "challengeParticipants",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "profile_pic"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const formattedChallenges = challenges.map((challenge) => {
      const participants = challenge.challengeParticipants || [];

      const topParticipants = participants.slice(0, 4).map((p) => ({
        id: String(p.user.id),
        image: p.user.profile_pic || "",
      }));

      return {
        id: String(challenge.id),
        category: challenge.category || "Running",
        title: challenge.title,
        details: challenge.description,
        date:
          challenge.status === "active"
            ? `Active til ${moment(challenge.end_date).format("DD MMM")}`
            : `Starts on ${moment(challenge.start_date).format("DD MMM")}`,
        startDate: moment(challenge.start_date).format("DD MMM YYYY"),
        endDate: moment(challenge.end_date).format("DD MMM YYYY"),
        goals: challenge.goal || "N/A",
        participants: topParticipants,
        extraCount: Math.max(participants.length - 4, 0),
        status: challenge.status === "active" ? "ongoing" : challenge.status,
      };
    });

    // Fetch workouts assigned to the user
    const workoutAssignments = await WorkoutManagement.findAll({
      where: { trainee_id: user_id },
      include: [
        {
          model: Workout,
          as: "workout",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedWorkouts = workoutAssignments.map((entry) => {
      const workout = entry.workout;
      return {
        id: workout.id,
        category: workout.category,
        name: workout.name,
        short_description: workout.short_description,
        duration: workout.duration,
        rest_time: workout.rest_time,
        number_of_exercises: workout.number_of_exercises,
        startDate: moment(entry.start_date).format("DD MMM YYYY"),
        endDate: moment(entry.end_date).format("DD MMM YYYY"),
        weekdays: entry.weekdays,
        status: entry.status,
        thumbnail_img: workout.thumbnail_img,
        sets_reps: workout.sets_reps,
        how_to_perform: workout.how_to_perform,
      };
    });

    res.status(200).json({
      user_id,
      challenges: formattedChallenges,
      workouts: formattedWorkouts,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, role, status } =
      req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role,
      status,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.updateUser_app = async (req, res) => {
//   const { id, ...rest } = req.body;

//   try {
//     if (!id) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     let IMG_URL = "https://huffnetwork.demowebtest.com/Huff_Backend/uploads/";
//     // Handle profile_pic upload
//     const profilePicFilename = req.file?.filename;
//     if (profilePicFilename) {
//       rest.profile_pic = `${IMG_URL}${profilePicFilename}`;
//     }

//     // if (rest.profile_pic && !rest.profile_pic.startsWith('http')) {
//     //   rest.profile_pic = `${IMG_URL}${profilePicFilename}`;
//     // }

//     await user.update(rest);

//     res.status(200).json({ message: "User updated successfully", user });
//   } catch (error) {
//     console.error("Update user error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateUser_app = async (req, res) => {
  console.log("Update user request body------:", req.body);
  const { id, firstName, lastName, phone_number, gender, location, dob } =
    req.body;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let IMG_URL = "https://huffnetwork.demowebtest.com/Huff_Backend/uploads/";
    const uploadDir = path.join(__dirname, "../uploads");

    let updatedData = {
      firstName,
      lastName,
      phone_number,
      gender,
      location,
      dob,
    };

    // Handle profile picture upload
    const profilePicFilename = req.file?.filename;
    if (profilePicFilename) {
      // Delete old profile picture if it exists
      if (user.profile_pic) {
        const oldFilename = user.profile_pic.split("/").pop(); // extract old file name
        const oldFilePath = path.join(uploadDir, oldFilename);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // delete old profile picture
        }
      }

      updatedData.profile_pic = `${IMG_URL}${profilePicFilename}`;
    }

    // Update user with new data
    await user.update(updatedData);

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUserImg_app = async (req, res) => {
  const { id } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.profile_pic) {
      const fileName = user.profile_pic.split("/").pop(); // extract filename
      const filePath = path.join(__dirname, "../uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // delete the file
      }
      await user.update({ profile_pic: null }); // clear the profile_pic field
      res
        .status(200)
        .json({ message: "Profile picture deleted successfully", user });
    } else {
      res.status(404).json({ message: "No profile picture to delete" });
    }
  } catch (error) {
    console.error("Delete user image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.signup_app = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone_number, role } =
      req.body;

    let status = "active"; // default status
    // 1. Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    if (role == "trainer") {
      status = "pending"; // default status for trainers
    }

    // 2. Email & username uniqueness check
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      username: `${firstName} ${lastName}`, // use email as username
      password: hashedPassword,
      status,
      phone_number,
      role, // will use default if not provided
    });

    // 5. Return user data (never return password)
    const { password: _, ...userData } = user.toJSON();
    userData.password = undefined; // explicitly remove password field
    res.status(201).json({
      message: "User registered successfully!",
      user: userData,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: {
          [Op.ne]: "admin", // Exclude users with role 'admin'
        },
      },
      attributes: { exclude: ["password"] },
      include: [
        {
          association: "Trainers", // comes from as: 'Trainers' in model
          attributes: ["id", "firstName", "lastName", "email"],
          through: { attributes: [] }, // hide pivot table data
        },
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.GetUser_app = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "otp"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const {
      id,
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      status,
      assignedTrainerIds,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updatedPassword = user.password;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    await user.update({
      firstName,
      lastName,
      username,
      email,
      password: updatedPassword,
      role,
      status,
    });

    // Handle trainer assignments if role is 'trainee'
    if (role === "trainee" && Array.isArray(assignedTrainerIds)) {
      // Remove previous assignments
      await CoachesClasses.destroy({ where: { traineeId: id } });

      // Assign new trainers
      const newAssignments = assignedTrainerIds.map((trainerId) => ({
        trainerId,
        traineeId: id,
      }));

      await CoachesClasses.bulkCreate(newAssignments);
    }

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getInitialDropdownData = async (req, res) => {
  try {
    // Fetch all active trainers
    const trainers = await User.findAll({
      where: { role: "trainer", status: "active" },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    // Fetch all active trainees
    const trainees = await User.findAll({
      where: { role: "trainee", status: "active" },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    // Fetch all workouts
    const workouts = await Workout.findAll({
      attributes: ["id", "name", "category"],
    });

    res.json({
      trainers,
      trainees,
      workouts,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch dropdown data",
      details: error.message,
    });
  }
};

exports.UserchangePassword_app = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedNewPassword });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// exports.getUserRegistrationsByRange = async (req, res) => {
//   const { Op, fn, col, literal } = require("sequelize");
//   const range = req.body.range || "day";
//   const now = new Date();

//   let startDate;
//   let groupFormat;

//   if (range === "day") {
//     startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//     groupFormat = "%H:00";
//   } else if (range === "week") {
//     startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//     groupFormat = "%Y-%m-%d";
//   } else if (range === "month") {
//     startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//     groupFormat = "%Y-%m-%d";
//   } else {
//     return res.status(400).json({ message: "Invalid range" });
//   }

//   try {
//     const users = await User.findAll({
//       where: {
//         createdAt: {
//           [Op.between]: [startDate, now],
//         },
//       },
//       attributes: [
//         [fn("DATE_FORMAT", col("createdAt"), groupFormat), "timeGroup"],
//         [fn("COUNT", col("id")), "count"],
//       ],
//       group: [literal("timeGroup")],
//       order: [literal("timeGroup ASC")],
//       raw: true,
//     });

//     res.status(200).json({ data: users });
//   } catch (error) {
//     console.error("Error fetching registration stats:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getUserRegistrationsByRange = async (req, res) => {
  const { Op } = require("sequelize");
  const range = req.body.range || "day";
  const now = new Date();
  let startDate;

  try {
    if (range === "day") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const users = await User.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, now],
          },
        },
      });

      // Group by hour
      const hourlyCounts = {};
      users.forEach((user) => {
        const hour = new Date(user.createdAt).getHours();
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
      });

      const data = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        count: hourlyCounts[i] || 0,
      }));

      return res.status(200).json({ data });
    } else if (range === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const users = await User.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, now],
          },
        },
      });

      // Group by date (last 7 days)
      const dailyCounts = {};
      users.forEach((user) => {
        const day = new Date(user.createdAt).toISOString().split("T")[0]; // e.g., "2025-07-15"
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      const data = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        return {
          day: dateStr,
          count: dailyCounts[dateStr] || 0,
        };
      });

      return res.status(200).json({ data });
    } else if (range === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const users = await User.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, now],
          },
        },
      });

      const dailyCounts = {};
      users.forEach((user) => {
        const day = new Date(user.createdAt).toISOString().split("T")[0];
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      const data = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        return {
          day: dateStr,
          count: dailyCounts[dateStr] || 0,
        };
      });

      return res.status(200).json({ data });
    } else {
      return res.status(400).json({ message: "Invalid range" });
    }
  } catch (error) {
    console.error("Error fetching registration stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
