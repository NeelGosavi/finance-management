// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware - FIXED VERSION
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) {
        break;
      }
    }
    
    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Return validation errors
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  };
};

// User validation rules
const userValidation = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role'),
  ],
  
  login: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  
  updatePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  
  updateUser: [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('role').optional().isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
};

// Transaction validation rules
const transactionValidation = {
  create: [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('description').optional().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid transaction ID'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
    body('category').optional().trim().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('description').optional().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  ],
  
  getTransactions: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format. Use YYYY-MM-DD'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format. Use YYYY-MM-DD'),
    query('type').optional().isIn(['income', 'expense', 'all']).withMessage('Type must be income, expense, or all'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('sortBy').optional().isString().withMessage('Invalid sort field'),
  ],
};

// Dashboard validation rules
const dashboardValidation = {
  getSummary: [
    query('startDate').optional().isISO8601().withMessage('Invalid start date format. Use YYYY-MM-DD'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format. Use YYYY-MM-DD'),
  ],
  
  getCategoryBreakdown: [
    query('startDate').optional().isISO8601().withMessage('Invalid start date format. Use YYYY-MM-DD'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format. Use YYYY-MM-DD'),
    query('type').optional().isIn(['income', 'expense', 'all']).withMessage('Type must be income, expense, or all'),
  ],
  
  getTrends: [
    query('months').optional().isInt({ min: 1, max: 24 }).withMessage('Months must be between 1 and 24'),
  ],
  
  getRecent: [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
};

module.exports = {
  validate,
  userValidation,
  transactionValidation,
  dashboardValidation,
};  