const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Expense = require('../models/Expense');

// @route   GET api/team/expenses
// @desc    Get all expenses for a manager's team
// @access  Private (Manager)
router.get('/expenses', auth, async (req, res) => {
    try {
        const managerId = req.user.id;

        // Find all users who have this manager
        const teamMembers = await User.find({ manager: managerId }).select('_id');
        const teamMemberIds = teamMembers.map(user => user._id);

        // Find all expenses submitted by those team members
        const expenses = await Expense.find({ employee: { $in: teamMemberIds } })
            .populate('employee', 'name')
            .sort({ date: -1 });

        const formattedExpenses = expenses.map(exp => ({
            id: exp._id,
            employeeId: exp.employee._id,
            employeeName: exp.employee.name,
            amount: exp.amount,
            currency: exp.currency,
            category: exp.category,
            description: exp.description,
            date: exp.date,
            receiptUrl: exp.receiptUrl,
            status: exp.status,
            approvalSteps: exp.approvalWorkflow,
            createdAt: exp.createdAt,
            updatedAt: exp.updatedAt,
        }));
        
        res.json(formattedExpenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;