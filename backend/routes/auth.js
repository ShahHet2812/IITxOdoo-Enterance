const express = require('express');
const router = express.Router();
// Make sure to export 'getMe' from your controller
const { signup, login, getMe } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);

// ADD THIS NEW ROUTE
router.get('/me', auth, getMe);

module.exports = router;