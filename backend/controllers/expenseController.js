const Expense = require('../models/Expense');
const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification'); // Make sure you have this model created
const { createWorker } = require('tesseract.js');

// Helper function to parse text and extract information
const parseReceipt = (text) => {
    const lines = text.split('\n');
    let amount = null;
    let date = null;
    let description = '';
    let vendor = '';
    let category = '';
    let currency = null; // New variable for currency

    // Keywords for category detection
    const categoryKeywords = {
        'Travel': ['uber', 'lyft', 'taxi', 'airline', 'hotel', 'airbnb'],
        'Meals & Entertainment': ['restaurant', 'bar', 'cafe', 'food', 'grill'],
        'Office Supplies': ['staples', 'office depot', 'supplies'],
        'Software & Subscriptions': ['software', 'subscription', 'aws', 'google'],
        'Marketing': ['marketing', 'ads', 'advertising'],
        'Equipment': ['electronics', 'best buy', 'apple store'],
    };

    // Map of symbols/codes to 3-letter currency codes
    const currencySymbols = {
        '$': 'USD', 'USD': 'USD',
        '€': 'EUR', 'EUR': 'EUR',
        '£': 'GBP', 'GBP': 'GBP',
        '₹': 'INR', 'INR': 'INR',
        '¥': 'JPY', 'JPY': 'JPY',
        'C$': 'CAD', 'CAD': 'CAD',
        'A$': 'AUD', 'AUD': 'AUD',
    };
    
    // More robust regex patterns for date matching
    const dateRegexes = [
        /(?:\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b)/, // Matches MM/DD/YYYY, MM-DD-YYYY, etc.
        /(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{1,2},\s\d{4}\b)/i, // Matches Month DD, YYYY
        /(?:\b\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,\s\d{4}\b)/i // Matches DD Month, YYYY
    ];

    const amountRegex = /(?:total|amount)\s*[:\s]*\$?(\d+\.\d{2})/i;

    // Attempt to get vendor from the first few lines
    if (lines.length > 0) {
        vendor = lines[0];
    }

    // Find date using multiple patterns
    for (const line of lines) {
        if (date) break; // Stop if date is already found
        for (const regex of dateRegexes) {
            const dateMatch = line.match(regex);
            if (dateMatch) {
                const parsedDate = new Date(dateMatch[0]);
                if (!isNaN(parsedDate.getTime())) {
                    date = parsedDate;
                    break;
                }
            }
        }
    }

    // Find currency by checking for symbols/codes
    for (const line of lines) {
        if (currency) break;
        // Prioritize longer keys first (e.g., 'USD' before '$') to avoid incorrect matches
        const sortedSymbols = Object.keys(currencySymbols).sort((a, b) => b.length - a.length);
        for (const symbol of sortedSymbols) {
             // Using a regex to match the symbol as a whole word or character
            const currencyRegex = new RegExp(`\\b${symbol.replace('$', '\\$').replace('€', '€').replace('£', '£').replace('₹', '₹').replace('¥', '¥')}\\b`, 'i');
            if (currencyRegex.test(line) || line.includes(symbol)) {
                currency = currencySymbols[symbol];
                break;
            }
        }
    }


    lines.forEach(line => {
        const lowerCaseLine = line.toLowerCase();

        const amountMatch = line.match(amountRegex);
        if (amountMatch && !amount) {
            amount = parseFloat(amountMatch[1]);
        }

        // Check for category keywords
        if (!category) {
            for (const cat in categoryKeywords) {
                for (const keyword of categoryKeywords[cat]) {
                    if (lowerCaseLine.includes(keyword)) {
                        category = cat;
                        break;
                    }
                }
                if (category) break;
            }
        }
    });

    // Fallback for amount if "total" or "amount" is not found
    if (!amount) {
        const genericAmountRegex = /\$?(\d+\.\d{2})/g;
        let amounts = [];
        let match;
        while ((match = genericAmountRegex.exec(text)) !== null) {
            amounts.push(parseFloat(match[1]));
        }
        if (amounts.length > 0) {
            amount = Math.max(...amounts); // Assume the largest number is the total
        }
    }

    // Use the vendor and a few lines as description
    description = lines.slice(0, 4).join(' ');

    return {
        amount,
        date,
        description: description || vendor,
        vendor,
        category: category || 'Other', // Default to 'Other' if no category is found
        currency // Return the detected currency
    };
};


// @route   POST api/expenses/scan
// @desc    Scan a receipt and extract expense data
exports.scanReceipt = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    const worker = await createWorker('eng');

    try {
        const { data: { text } } = await worker.recognize(req.file.path);
        await worker.terminate();

        const extractedData = parseReceipt(text);

        res.json(extractedData);
    } catch (err) {
        console.error(err.message);
        await worker.terminate();
        res.status(500).send('Server Error');
    }
};


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

        // FIX: Auto-approve if amount is below or equal to the threshold
        if (amount <= company.approvalThreshold) {
            const newExpense = new Expense({
                employee: req.user.id,
                company: user.company,
                amount,
                currency,
                category,
                description,
                date,
                receiptUrl,
                approvalWorkflow: [],
                status: 'approved', // Auto-approved
            });
            const expense = await newExpense.save();
            new Notification({
              user: user.id,
              message: `Your expense request for ${currency} ${amount} has been auto-approved.`,
            }).save();
            return res.json(expense);
        }


        const approvalSteps = [];
        const admin = await User.findOne({ company: user.company, role: 'admin' });

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
                new Notification({
                  user: manager.id,
                  message: `${user.name} submitted an expense request for ${currency} ${amount}.`,
                }).save();
                if (admin) {
                  new Notification({
                    user: admin.id,
                    message: `${user.name} sent an expense request of ${currency} ${amount} to ${manager.name}.`,
                  }).save();
                }
            }
        }

        // Step 2: Admin Approval for high-value expenses (if required)
        if (company.requireAdminApproval && amount > company.approvalThreshold) {
            if (admin) {
                if (!approvalSteps.some(step => step.approver.toString() === admin._id.toString())) {
                    approvalSteps.push({
                        approver: admin._id,
                        approverName: admin.name,
                        approverRole: admin.role,
                        status: 'pending',
                    });
                     new Notification({
                        user: admin.id,
                        message: `An expense request of ${currency} ${amount} from ${user.name} requires your approval.`,
                    }).save();
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
        new Notification({
          user: user.id,
          message: `Your expense request for ${currency} ${amount} has been submitted.`,
        }).save();
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

        const expense = await Expense.findById(expenseId).populate('employee');
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
        const admin = await User.findOne({ company: approver.company, role: 'admin' });

        if (status === 'rejected') {
            expense.status = 'rejected';
            new Notification({
              user: expense.employee.id,
              message: `Your expense request for ${expense.currency} ${expense.amount} was rejected by ${approver.name}.`,
            }).save();
            if (admin && admin.id !== approver.id) {
              new Notification({
                user: admin.id,
                message: `${approver.name} rejected an expense request of ${expense.currency} ${expense.amount} from ${expense.employee.name}.`,
              }).save();
            }
        } else {
            const allApproved = expense.approvalWorkflow.every(step => step.status === 'approved');
            if (allApproved) {
                expense.status = 'approved';
            }
            new Notification({
              user: expense.employee.id,
              message: `Your expense request for ${expense.currency} ${expense.amount} was approved by ${approver.name}.`,
            }).save();
            if (admin && admin.id !== approver.id) {
              new Notification({
                user: admin.id,
                message: `${approver.name} approved an expense request of ${expense.currency} ${expense.amount} from ${expense.employee.name}.`,
              }).save();
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