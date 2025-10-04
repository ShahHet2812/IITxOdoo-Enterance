const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, getNotifications);
router.put('/mark-read', auth, markNotificationsAsRead);

module.exports = router;