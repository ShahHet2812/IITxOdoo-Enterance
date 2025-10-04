const express = require('express');
const router = express.Router();
const { createExpense, getExpenses, getExpenseById, updateExpenseStatus } = require('../controllers/expenseController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createExpense);
router.get('/', auth, getExpenses);
router.get('/:id', auth, getExpenseById);
router.put('/:id/status', auth, updateExpenseStatus);

module.exports = router;