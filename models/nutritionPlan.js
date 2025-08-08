const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NutritionPlan = sequelize.define(
  "NutritionPlan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    upload_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Assuming you have a 'users' table
        key: "id",
      },
    },
    plan_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    pdf_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "nutrition_plans",
  }
);
NutritionPlan.associate = (models) => {
  // Existing relation
  NutritionPlan.hasMany(models.AssignNutritionPlan, {
    foreignKey: 'nutrition_plan_id',
    as: 'assignments',
  });

  // ✅ Add this to link NutritionPlan.upload_by → User
  NutritionPlan.belongsTo(models.User, {
    foreignKey: 'upload_by',
    as: 'uploader',
  });
};


module.exports = NutritionPlan;
