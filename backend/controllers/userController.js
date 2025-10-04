const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// @route   POST api/users
// @desc    Create a new user within the same company
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  const { name, email, password, role, managerId } = req.body;

  try {
    const adminUser = await User.findById(req.user.id);
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admin role required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
      company: adminUser.company, // Associate with the admin's company
      manager: managerId || undefined,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create notification for the new employee
    if (managerId) {
      const manager = await User.findById(managerId);
      if (manager) {
        new Notification({
          user: user.id,
          message: `You have been assigned a new manager: ${manager.name}.`,
        }).save();
        new Notification({
          user: managerId,
          message: `${user.name} has been added to your team.`,
        }).save();
      }
    }


    const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company,
        managerId: user.manager,
        createdAt: user.createdAt,
    };

    res.status(201).json(userResponse);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @route   GET api/users
// @desc    Get all users for the admin's company
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    // Find the admin user making the request to get their company ID
    const adminUser = await User.findById(req.user.id);
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admin role required' });
    }

    // Find all users belonging to that company and exclude their passwords
    const users = await User.find({ company: adminUser.company }).select('-password');

    const formattedUsers = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company,
        managerId: user.manager,
        createdAt: user.createdAt,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    const { name, email, role, managerId } = req.body;
    const { id } = req.params;

    try {
        const adminUser = await User.findById(req.user.id);
        if (adminUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        let user = await User.findById(id);
        if (!user || user.company.toString() !== adminUser.company.toString()) {
            return res.status(404).json({ msg: 'User not found in this company' });
        }

        const userFields = { name, email, role };
        if (managerId) {
            userFields.manager = managerId;
        } else {
            userFields.manager = undefined;
        }


        user = await User.findByIdAndUpdate(id, { $set: userFields }, { new: true }).select('-password');

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company,
            managerId: user.manager,
            createdAt: user.createdAt,
        };

        res.json(userResponse);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (adminUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const user = await User.findById(req.params.id);

        if (!user || user.company.toString() !== adminUser.company.toString()) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if(user.id.toString() === adminUser.id.toString()){
            return res.status(400).json({ msg: 'Admin cannot delete their own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};