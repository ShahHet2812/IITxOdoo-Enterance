const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  // FIX: Add currencySymbol to store the currency symbol
  currencySymbol: {
    type: String,
    required: true,
    default: '$',
  },
  // Add these new fields for workflow configuration
  approvalThreshold: {
    type: Number,
    default: 1000,
  },
  requireManagerApproval: {
    type: Boolean,
    default: true,
  },
  requireAdminApproval: {
    type: Boolean,
    default: false, // Default to false for simplicity
  },
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);