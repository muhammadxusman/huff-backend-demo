
// const admin = require('firebase-admin');
// const path = require('path');

// // Absolute path to service account file
// const serviceAccount = require(path.resolve(__dirname, '../huff-network-firebase-adminsdk-fbsvc-a936dec455.json'));

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

// const sendPushNotification = async (deviceFcmToken, title, body, data = {}) => {
//     if (!deviceFcmToken || !title || !body) {
//         throw new Error('Device FCM token, title, and body are required to send a notification');
//     }
//   try {
//     const message = {
//       token: deviceFcmToken,
//       notification: { title, body },
//       data, // optional custom data payload
//     };

//     const response = await admin.messaging().send(message);
//     console.log('Notification sent:', response);
//     return response;
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     throw error;
//   }
// };

// module.exports = { sendPushNotification };


const admin = require('firebase-admin');
const path = require('path');
const User = require('../models/User'); // Adjust the path
const Notification = require('../models/notification')

// Firebase Admin SDK setup
const serviceAccount = require(path.resolve(__dirname, '../huff-network-firebase-adminsdk-fbsvc-a936dec455.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Sends a push notification to a user (via FCM token), and logs it in the notifications table.
 * 
 * @param {string} fcmToken - User's FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body/message
 * @param {object} data - Optional custom data payload
 * @returns {Promise<object>} - Firebase response
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  try {
    if (!fcmToken || !title || !body) {
      return 'FCM token, title, and body are required';
    }

    // 1. Fetch user by FCM token
    const user = await User.findOne({
      where: { fcm_token: fcmToken },
    });

    if (!user) {
      throw new Error(`No user found with FCM token: ${fcmToken}`);
    }

    // 2. Check if user allows notifications
    if (!user.is_allowed_notification) {
      console.log(`User ${user.id} has disabled notifications.`);
      return { message: 'User has disabled notifications' };
    }

    // 3. Send push notification via Firebase
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: {
        ...data,
        userId: String(user.id),
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`Notification sent to user ${user.id}:`, response);

    // 4. Log notification in the database
    await Notification.create({
      user_id: user.id,
      title,
      message: body,
      trigerred_at: new Date(),
    });

    return response;

  } catch (error) {
    console.error('Error sending push notification:', error.message);
    if (error.message == 'Requested entity was not found.') {
      return 'Invalid FCM token';
    }
    // throw error;
  }
};

module.exports = { sendPushNotification };
