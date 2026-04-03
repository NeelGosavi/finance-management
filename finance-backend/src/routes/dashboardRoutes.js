// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(protect);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/categories', dashboardController.getCategoryBreakdown);
router.get('/trends', dashboardController.getMonthlyTrends);
router.get('/recent', dashboardController.getRecentActivity);

module.exports = router;