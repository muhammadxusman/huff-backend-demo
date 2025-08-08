const express = require('express');
const router = express.Router();
const { loginUser,loginUser_app,ForgotPassword_app,verifyOTP,setNewPassword } = require('../controllers/authController');

// POST /api/login
router.post('/login', loginUser);

router.post('/signin', loginUser_app); // For app login, no authentication needed
router.post('/send-otp', ForgotPassword_app); // For app login, no authentication needed
router.post('/verify-otp', verifyOTP); // For app login, no authentication needed
router.post('/set-new-password', setNewPassword); // For app login, no authentication needed

module.exports = router;
