const { log } = require("console");
const { NutritionPlan, User, AssignNutritionPlan } = require("../models");

const fs = require("fs");
const path = require("path");
const { sendPushNotification } = require("../services/notificationService");

exports.createNutritionPlan = async (req, res) => {
  try {
    const { plan_name, description, upload_by } = req.body;
    const pdfFile = req.file;

    if (!pdfFile) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const pdfUrl = `https://huffnetwork.demowebtest.com/Huff_Backend/uploads/nutrition/${pdfFile.filename}`;

    const newPlan = await NutritionPlan.create({
      plan_name,
      description,
      upload_by,
      pdf_url: pdfUrl,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Nutrition plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Error creating nutrition plan:", error);
    res.status(500).json({ error: "Failed to create nutrition plan" });
  }
};

exports.getAllNutritionPlans = async (req, res) => {
  try {
    const plans = await NutritionPlan.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.json({
      message: "Nutrition plans fetched successfully",
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching nutrition plans:", error);
    res.status(500).json({ error: "Failed to fetch nutrition plans" });
  }
};

exports.updateNutritionPlan = async (req, res) => {
  try {
    const { id, plan_name, description } = req.body;
    const pdfFile = req.file;

    if (!id) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    const nutritionPlan = await NutritionPlan.findByPk(id);
    if (!nutritionPlan) {
      return res.status(404).json({ error: "Nutrition plan not found" });
    }

    let pdfUrl = nutritionPlan.pdf_url;

    if (pdfFile) {
      // Delete old file
      if (pdfUrl) {
        const fileName = path.basename(pdfUrl); // extract filename
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "nutrition",
          fileName
        );

        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Failed to delete old PDF:", err);
          }
        });
      }

      // Set new URL
      pdfUrl = `https://huffnetwork.demowebtest.com/Huff_Backend/uploads/nutrition/${pdfFile.filename}`;
    }

    await nutritionPlan.update({
      plan_name,
      description,
      pdf_url: pdfUrl,
      updated_at: new Date(),
    });

    return res.json({
      message: "Nutrition plan updated successfully",
      data: nutritionPlan,
    });
  } catch (error) {
    console.error("Error updating nutrition plan:", error);
    res.status(500).json({ error: "Failed to update nutrition plan" });
  }
};

// controller/nutritionController.js (or a dedicated controller)

exports.assignNutritionPlan = async (req, res) => {
  try {
    const { trainee_id, nutrition_plan_id, assigned_by } = req.body;

    // Optional: Validate user and plan existence
    const user = await User.findByPk(trainee_id);
    const plan = await NutritionPlan.findByPk(nutrition_plan_id);

    if (!user || !plan) {
      return res
        .status(404)
        .json({ error: "Trainee or Nutrition Plan not found" });
    }

    const assignment = await AssignNutritionPlan.create({
      trainee_id,
      nutrition_plan_id,
      assigned_by,
      assigned_at: new Date(),
    });

sendPushNotification(user.fcm_token, "Nutrition Plan Assigned", `You have been assigned a new nutrition plan: ${plan.plan_name}`);

    res.status(201).json({
      message: "Nutrition plan assigned successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error assigning nutrition plan:", error);
    res.status(500).json({ error: "Failed to assign nutrition plan" });
  }
};

// controller/nutritionController.js

exports.getNutritionAssignmentOptions = async (req, res) => {
  try {
    // Get all trainees
    const trainees = await User.findAll({
      where: { role: "trainee" },
      attributes: ["id", "firstName", "lastName"],
      order: [["firstName", "ASC"]],
    });

    // Get all nutrition plans
    const plans = await NutritionPlan.findAll({
      attributes: ["id", "plan_name"],
      order: [["created_at", "DESC"]],
    });

    res.json({
      trainees: trainees.map((t) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
      })),
      nutrition_plans: plans,
    });
  } catch (error) {
    console.error("Error fetching nutrition assignment options:", error);
    res.status(500).json({ error: "Failed to fetch assignment options" });
  }
};

exports.getAllAssignedNutritionPlans = async (req, res) => {
  try {
    const assignments = await AssignNutritionPlan.findAll({
      order: [["assigned_at", "DESC"]],
      include: [
        {
          model: User,
          as: "trainee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "assignedBy", // must match your model
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: NutritionPlan,
          as: "nutritionPlan",
          attributes: ["id", "plan_name", "description", "pdf_url"],
        },
      ],
    });

    res.status(200).json({
      message: "Assigned nutrition plans fetched successfully",
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching assigned nutrition plans:", error);
    res.status(500).json({ error: "Failed to fetch assigned nutrition plans" });
  }
};

exports.getAssignedNutritionPlanByUserId = async (req, res) => {

  console.log("Fetching assigned nutrition plan for user...",req.body);
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "User ID is required in the request body" });
    }
    let trainee_id = userId; // Assuming userId is the ID of the trainee
    const assignment = await AssignNutritionPlan.findOne({
      where: { trainee_id }, // assuming this is the foreign key column in your AssignNutritionPlan model
      order: [["assigned_at", "DESC"]],
      include: [
        {
          model: User,
          as: "trainee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: NutritionPlan,
          as: "nutritionPlan",
          attributes: ["id", "plan_name", "description", "pdf_url"],
        },
      ],
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "No assigned nutrition plan found for this user" });
    }

    res.status(200).json({
      message: "Assigned nutrition plan fetched successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error fetching assigned nutrition plan:", error);
    res.status(500).json({ error: "Failed to fetch assigned nutrition plan" });
  }
};
