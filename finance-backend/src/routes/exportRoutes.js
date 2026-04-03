// src/routes/exportRoutes.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

// All export routes require authentication
router.use(protect);

// Export endpoints (accessible by all authenticated users)
router.get('/transactions', exportController.exportTransactionsToCSV);
router.get('/summary', exportController.exportSummaryToCSV);

module.exports = router;