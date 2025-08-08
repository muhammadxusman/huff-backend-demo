const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AssignNutritionPlan = sequelize.define(
  'AssignNutritionPlan',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    trainee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nutrition_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'assign_nutrition_plans',
  }
);

// 👇 Define associations
AssignNutritionPlan.associate = (models) => {
  AssignNutritionPlan.belongsTo(models.User, {
    foreignKey: 'trainee_id',
    as: 'trainee',
  });

  AssignNutritionPlan.belongsTo(models.User, {
    foreignKey: 'assigned_by',
    as: 'assignedBy',
  });

  AssignNutritionPlan.belongsTo(models.NutritionPlan, {
    foreignKey: 'nutrition_plan_id',
    as: 'nutritionPlan',
  });
};



module.exports = AssignNutritionPlan;
