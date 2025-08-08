const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // already handles uploads
const nutritionPlanController = require('../controllers/nutritionPlanController');

router.post(
  '/create-nutrition-plan',
  upload.single('pdf'), // Accepts one file named 'pdf'
  nutritionPlanController.createNutritionPlan
);

router.get('/all-nutrition-plans', nutritionPlanController.getAllNutritionPlans);

router.put('/update-nutrition-plan', upload.single('pdf'), nutritionPlanController.updateNutritionPlan);

router.post('/assign-nutrition-plan', nutritionPlanController.assignNutritionPlan);

router.get("/nutrition-plan-options", nutritionPlanController.getNutritionAssignmentOptions);

router.get("/nutrition-plan-assignments", nutritionPlanController.getAllAssignedNutritionPlans);

router.post("/nutrition-plan-assignments-user", nutritionPlanController.getAssignedNutritionPlanByUserId);

module.exports = router;
