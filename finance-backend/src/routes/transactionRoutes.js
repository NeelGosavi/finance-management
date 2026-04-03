// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const { canModifyTransactions, canDeleteTransactions } = require('../middleware/roleCheck');
const { validate, transactionValidation } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Everyone can view transactions (now global)
router.get('/', validate(transactionValidation.getTransactions), transactionController.getTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransaction);

// Only Analysts and Admins can create and update
router.post('/', canModifyTransactions, validate(transactionValidation.create), transactionController.createTransaction);
router.patch('/:id', canModifyTransactions, validate(transactionValidation.update), transactionController.updateTransaction);

// Only Admins can delete
router.delete('/:id', canDeleteTransactions, transactionController.deleteTransaction);

module.exports = router;