// src/middleware/roleCheck.js

// Restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action. Required roles: ' + roles.join(', '),
      });
    }
    next();
  };
};

// Check if user can create/modify transactions
const canModifyTransactions = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'analyst') {
    return next();
  }
  return res.status(403).json({
    status: 'error',
    message: 'Viewers cannot create or modify transactions. Only Analysts and Admins can.',
  });
};

// Check if user can delete transactions
const canDeleteTransactions = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    status: 'error',
    message: 'Only Admins can delete transactions.',
  });
};

// Check if user can manage other users
const canManageUsers = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    status: 'error',
    message: 'Only Admins can manage users.',
  });
};

module.exports = {
  restrictTo,
  canModifyTransactions,
  canDeleteTransactions,
  canManageUsers,
};