const express = require('express');
const router = express.Router();
// Add createUser to the import
const { getUsers, updateUser, deleteUser, createUser } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

// @route   POST api/users
// @desc    Create a new user
// @access  Private (Admin)
router.post('/', auth, createUser); // Add this new route

// @route   GET api/users
// @desc    Get all users for the company
// @access  Private (Admin)
router.get('/', auth, getUsers);

// @route   PUT api/users/:id
// @desc    Update user role or manager
// @access  Private (Admin)
router.put('/:id', auth, updateUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete('/:id', auth, deleteUser);

module.exports = router;