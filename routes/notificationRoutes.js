const express = require('express');
const router = express.Router();
const { createNotification,getNotifications } = require('../controllers/notofication');

router.post('/create-notification', createNotification);
router.post('/get-notifications', getNotifications); // Assuming you want to use the same controller for fetching notifications

module.exports = router;
