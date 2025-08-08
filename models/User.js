const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    dob: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_allowed_notification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    profile_pic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "trainee", "trainer"),
      allowNull: false,
      defaultValue: "trainee",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "pending"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

User.associate = (models) => {
  // A Trainer can have many Trainees
  User.belongsToMany(User, {
    as: "Trainees",
    through: models.CoachesClasses,
    foreignKey: "trainerId",
    otherKey: "traineeId",
  });

  // A Trainee can have many Trainers
  User.belongsToMany(User, {
    as: "Trainers",
    through: models.CoachesClasses,
    foreignKey: "traineeId",
    otherKey: "trainerId",
  });

  // A Trainee has many assigned workouts
  User.hasMany(models.WorkoutManagement, {
    foreignKey: "trainee_id",
    as: "assignedWorkouts",
  });

  // A Trainer has assigned many workouts
  User.hasMany(models.WorkoutManagement, {
    foreignKey: "assign_by",
    as: "givenWorkouts",
  });

  User.belongsToMany(models.Challenge, {
    through: models.ChallengeParticipant,
    foreignKey: "user_id",
    as: "joinedChallenges",
  });

  User.hasMany(models.Notification, {
    foreignKey: 'user_id',
    as: 'notifications',
    onDelete: 'CASCADE', // optional
  });

    User.hasMany(models.AssignNutritionPlan, {
    foreignKey: 'trainee_id',
    as: 'assignedNutritionPlans',
  });

  User.hasMany(models.AssignNutritionPlan, {
    foreignKey: 'assigned_by',
    as: 'givenNutritionPlans',
  });


};

module.exports = User;
