const Company = require('../models/Company');
const User = require('../models/User');

// Get company details for the logged-in user
exports.getCompanyDetails = async (req, res) => {
    try {
        // First, get the current user from the request (added by auth middleware)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Then, find the company associated with that user
        const company = await Company.findById(user.company);
        if (!company) {
            return res.status(404).json({ msg: 'Company not found' });
        }
        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update company details (admin only)
exports.updateCompany = async (req, res) => {
    // Destructure the fields you want to update from the request body
    const { name, currency, approvalThreshold, requireManagerApproval, requireAdminApproval } = req.body;

    try {
        // Verify the current user is an admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin role required.' });
        }

        // Find the company to update
        let company = await Company.findById(user.company);
        if (!company) {
            return res.status(404).json({ msg: 'Company not found' });
        }

        // Build a company object with the new fields
        const companyFields = {};
        if (name) companyFields.name = name;
        if (currency) companyFields.currency = currency;
        if (approvalThreshold !== undefined) companyFields.approvalThreshold = approvalThreshold;
        if (requireManagerApproval !== undefined) companyFields.requireManagerApproval = requireManagerApproval;
        if (requireAdminApproval !== undefined) companyFields.requireAdminApproval = requireAdminApproval;

        // Update the company in the database
        company = await Company.findByIdAndUpdate(
            user.company,
            { $set: companyFields },
            { new: true } // This option returns the document after the update
        );

        res.json(company);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};