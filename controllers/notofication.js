const { Notification } = require("../models/index");

exports.createNotification = async (req, res) => {
  try {
    const { title, message, user_id } = req.body;

    // Validate required fields
    if (!title || !message || !user_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create the new notification
    const newNotification = await Notification.create({
      title,
      message,
      user_id,
    });

    return res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const notifications = await Notification.findAll({ where: { user_id } });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
