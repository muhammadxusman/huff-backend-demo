const express = require("express");
const router = express.Router();
const {
  createContactForm,
  getAllContactForms,
  updateNotificationPreference,
  updateContactFormReadStatus,
  getPlanOrWorkoutStats,
  getAggregateUserProgress,
} = require("../controllers/generalController");

router.post("/contact-form", createContactForm);
router.get("/get-contact-form", getAllContactForms);
router.post("/update-notification", updateNotificationPreference);
router.post("/update-contact-form-read-status", updateContactFormReadStatus);
router.post("/get-plan-or-workout-stats", getPlanOrWorkoutStats);
router.post("/get-aggregate-user-progress", getAggregateUserProgress);

module.exports = router;
