const express = require('express');
const router = express.Router();
const { createExpense, getExpenses, getExpenseById, updateExpenseStatus, scanReceipt } = require('../controllers/expenseController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/', auth, createExpense);
router.get('/', auth, getExpenses);
router.get('/:id', auth, getExpenseById);
router.put('/:id/status', auth, updateExpenseStatus);
router.post('/scan', auth, upload.single('receipt'), scanReceipt);

module.exports = router;