const Expense = require('../models/Expense');
const User = require('../models/User');
const Company = require('../models/Company');

// @route   POST api/expenses
// @desc    Create a new expense claim
exports.createExpense = async (req, res) => {
    const { amount, currency, category, description, date, receiptUrl } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const company = await Company.findById(user.company);
        if (!company) {
            return res.status(404).json({ msg: 'Company not found' });
        }

        const approvalSteps = [];

        // Step 1: Manager Approval (if required)
        if (company.requireManagerApproval && user.manager) {
            const manager = await User.findById(user.manager);
            if (manager) {
                approvalSteps.push({
                    approver: user.manager,
                    approverName: manager.name,
                    approverRole: manager.role,
                    status: 'pending',
                });
            }
        }

        // Step 2: Admin Approval for high-value expenses (if required)
        if (company.requireAdminApproval && amount > company.approvalThreshold) {
            const admin = await User.findOne({ company: user.company, role: 'admin' });
            if (admin) {
                if (!approvalSteps.some(step => step.approver.toString() === admin._id.toString())) {
                    approvalSteps.push({
                        approver: admin._id,
                        approverName: admin.name,
                        approverRole: admin.role,
                        status: 'pending',
                    });
                }
            }
        }

        const newExpense = new Expense({
            employee: req.user.id,
            company: user.company,
            amount,
            currency,
            category,
            description,
            date,
            receiptUrl,
            approvalWorkflow: approvalSteps,
            status: approvalSteps.length > 0 ? 'pending' : 'approved',
        });

        const expense = await newExpense.save();
        res.json(expense);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/expenses
// @desc    Get expenses based on user role
exports.getExpenses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const company = await Company.findById(user.company);
        if (!company) return res.status(404).json({ msg: 'Company not found' });

        let expensesQuery;
        if (user.role === 'admin') {
            expensesQuery = Expense.find({ company: user.company });
        } else if (user.role === 'manager') {
            const teamMembers = await User.find({ manager: req.user.id }).select('_id');
            const teamMemberIds = teamMembers.map(user => user._id);

            // Find distinct expense IDs that match any of the criteria
            const expenseIds = await Expense.find({
                company: user.company,
                $or: [
                    { employee: { $in: teamMemberIds } },
                    { employee: user.id },
                    { 'approvalWorkflow.approver': user.id }
                ]
            }).distinct('_id');

            // Then fetch the full documents for those IDs
            expensesQuery = Expense.find({ '_id': { $in: expenseIds } });

        } else {
            expensesQuery = Expense.find({ employee: user.id });
        }

        const expenses = await expensesQuery.populate('employee', 'name').sort({ date: -1 });
        
        const needsConversion = user.role === 'manager' || user.role === 'admin';
        const conversionRates = {};

        const formattedExpenses = await Promise.all(expenses.map(async (exp) => {
            let convertedAmount;
            if (needsConversion && exp.currency !== company.currency) {
                if (!conversionRates[exp.currency]) {
                     try {
                        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${exp.currency}`);
                        const data = await response.json();
                        conversionRates[exp.currency] = data.rates[company.currency];
                    } catch (e) {
                        console.error("Currency conversion API failed:", e);
                        conversionRates[exp.currency] = 1;
                    }
                }
                convertedAmount = exp.amount * conversionRates[exp.currency];
            }

            return {
                id: exp._id,
                employeeId: exp.employee._id,
                employeeName: exp.employee.name,
                amount: exp.amount,
                currency: exp.currency,
                convertedAmount: convertedAmount,
                category: exp.category,
                description: exp.description,
                date: exp.date,
                receiptUrl: exp.receiptUrl,
                status: exp.status,
                approvalSteps: exp.approvalWorkflow,
                createdAt: exp.createdAt,
                updatedAt: exp.updatedAt,
            };
        }));

        res.json(formattedExpenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/expenses/:id
// @desc    Get a single expense by ID
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id).populate('employee', 'name');
        if (!expense) {
            return res.status(404).json({ msg: 'Expense not found' });
        }
        
        const user = await User.findById(req.user.id);
        if (user.company.toString() !== expense.company.toString()) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        res.json({
             id: expense._id,
            employeeId: expense.employee._id,
            employeeName: expense.employee.name,
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            description: expense.description,
            date: expense.date,
            receiptUrl: expense.receiptUrl,
            status: expense.status,
            approvalSteps: expense.approvalWorkflow,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/expenses/:id/status
// @desc    Approve or reject an expense
exports.updateExpenseStatus = async (req, res) => {
    const { status, comments } = req.body;
    const { id: expenseId } = req.params;
    const { id: approverId } = req.user;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided' });
    }

    try {
        const approver = await User.findById(approverId);
        if (approver.role !== 'manager' && approver.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to approve/reject expenses' });
        }

        const expense = await Expense.findById(expenseId);
        if (!expense) return res.status(404).json({ msg: 'Expense not found' });
        if (expense.company.toString() !== approver.company.toString()) {
            return res.status(403).json({ msg: 'Not authorized to act on this expense' });
        }
        
        const stepIndex = expense.approvalWorkflow.findIndex(
            step => step.approver.toString() === approverId && step.status === 'pending'
        );

        if (stepIndex === -1) {
            return res.status(400).json({ msg: 'No pending approval step found for this user or you have already acted on it.' });
        }

        expense.approvalWorkflow[stepIndex].status = status;
        expense.approvalWorkflow[stepIndex].comments = comments;
        expense.approvalWorkflow[stepIndex].timestamp = new Date();

        if (status === 'rejected') {
            expense.status = 'rejected';
        } else {
            const allApproved = expense.approvalWorkflow.every(step => step.status === 'approved');
            if (allApproved) {
                expense.status = 'approved';
            }
        }
        
        await expense.save();
        const populatedExpense = await Expense.findById(expense.id).populate('employee', 'name');
        
        res.json({
            id: populatedExpense._id,
            employeeId: populatedExpense.employee._id,
            employeeName: populatedExpense.employee.name,
            amount: populatedExpense.amount,
            currency: populatedExpense.currency,
            category: populatedExpense.category,
            description: populatedExpense.description,
            date: populatedExpense.date,
            receiptUrl: populatedExpense.receiptUrl,
            status: populatedExpense.status,
            approvalSteps: populatedExpense.approvalWorkflow,
            createdAt: populatedExpense.createdAt,
            updatedAt: populatedExpense.updatedAt,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};