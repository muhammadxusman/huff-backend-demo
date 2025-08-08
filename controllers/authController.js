const { User } = require("../models/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { GenerateOTP } = require("../helper");
const { sendTemplateDataMail } = require("../helper/sendEmail");
require("dotenv").config();

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({ message: "Your account is inactive" });
    }

    // Check if user is admin
    if (user.role !== "admin" && user.role !== "trainer") {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser_app = async (req, res) => {
  const { email, password, fcm_token } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (user.status === "inactive") {
      return res.status(403).json({ message: "Your account is inactive" });
    }

    if (user.status === "pending") {
      return res
        .status(403)
        .json({ message: "Your account is pending approval" });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Token expires in 365 days, hardcoded
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
    user.password = undefined; // Exclude password from response
    user.update({ fcm_token }); // Update FCM token in DB
    return res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.ForgotPassword_app = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and save OTP
    const otp = GenerateOTP();
    user.otp = otp;
    await user.save(); // Save OTP to DB

    // Send OTP email using EJS template
    await sendTemplateDataMail({
      emails: [email],
      subject: "Your OTP for Password Reset",
      templateName: "otp_email", // ensure you created `otp_email.ejs` under `email_templates`
      data: { otp },
    });

    return res.status(200).json({ message: "OTP has been sent to your email", success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await user.update({ otp: null });

    return res.status(200).json({ message: "OTP verified successfully", success: true  });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.setNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
     const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

     const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully", success: true  });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};