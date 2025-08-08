const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;
const trainerRoutes = require('./routes/coachesClassesRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const {sendPushNotification}= require('./services/notificationService');
const allowedOrigins = [
  'https://huff-network.web.app',    // Firebase frontend
  'http://localhost:5173',          // local development
  'http://172.17.10.70:5173'        // internal/dev IP (if needed)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

// sendPushNotification('c4utRMfHSbOhCvNFOZv8bi:APA91bFS8piM_Rx51lIDobJZaw6JF1lmxfBuusHd_qXXF3yH1UXdExwbRX9vQd-hpS1D1Fq7UVFP2bb-EfBjI9jrSEQVZZ0m72wCZrSCtDU4FMLU3TDMJ3s', 'Test Notification 123', 'This is a test notification from the server')

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});
const userRoutes = require('./routes/user');
app.use('/api', userRoutes);

const authRoutes = require('./routes/auth'); 
app.use('/api', authRoutes);  


app.use('/api', trainerRoutes);

app.use('/api', workoutRoutes);


const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api', dashboardRoutes);

const challengeRoutes = require('./routes/challengesRouter');
app.use('/api', challengeRoutes);

const faqRoutes = require('./routes/faqsRoutes');
app.use('/api', faqRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api', notificationRoutes);

const generalController = require('./routes/generalRoutes')
app.use('/api', generalController);

const nutritionPlanRoutes = require('./routes/nutritionPlanRoutes');
app.use('/api', nutritionPlanRoutes);

const startApp = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the app:', error);
  }
};

startApp();
