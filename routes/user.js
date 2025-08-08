const express = require('express');
const router = express.Router();
const { createUser, getAllUsers,UserchangePassword_app , 
  updateUser,getInitialDropdownData,signup_app,updateUser_app, GetUser_app, deleteUserImg_app,getUserRegistrationsByRange ,
getUserWorkoutChallenges,
} = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/users',authenticate, authorizeRoles('admin', 'trainer'), createUser);
router.get('/users', getAllUsers);
// Update user (using body only)
router.put('/update-users',authenticate, authorizeRoles('admin'), updateUser);

router.get('/get-all-dropdown-data', getInitialDropdownData);

router.post('/signup', signup_app); // For user signup, no authentication needed
router.get('/get-specific-user', GetUser_app); // For user signup, no authentication needed

router.post('/userchangePassword_app', UserchangePassword_app);

router.post(
  '/update-user-app',
  upload.single('profile_pic'),  // Handle single file
  updateUser_app
);

router.post('/delete-user-profile-img',deleteUserImg_app)

router.post("/user-registrations-data", getUserRegistrationsByRange);

router.post("/user-challenges-workouts", getUserWorkoutChallenges);


module.exports = router;
