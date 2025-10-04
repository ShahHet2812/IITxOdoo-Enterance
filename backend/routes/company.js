const express = require('express');
const router = express.Router();
const { getCompanyDetails, updateCompany } = require('../controllers/companyController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, getCompanyDetails);
router.put('/', auth, updateCompany);

module.exports = router;