// src/controllers/dashboardController.js
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Get dashboard summary - GLOBAL (no user filter)
exports.getDashboardSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { isDeleted: false };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    summary.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.totalAmount;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpense = item.totalAmount;
        expenseCount = item.count;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        totalTransactions: incomeCount + expenseCount,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get category breakdown - GLOBAL
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { startDate, endDate, type = 'all' } = req.query;

    const matchStage = { isDeleted: false };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    if (type !== 'all') {
      matchStage.type = type;
    }

    const breakdown = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category',
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              category: '$_id.category',
              totalAmount: '$totalAmount',
              count: '$count',
            },
          },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        income: breakdown.find((b) => b._id === 'income') || { categories: [], total: 0 },
        expense: breakdown.find((b) => b._id === 'expense') || { categories: [], total: 0 },
      },
    });
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get monthly trends - GLOBAL
exports.getMonthlyTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const trends = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
          },
          data: {
            $push: {
              type: '$_id.type',
              totalAmount: '$totalAmount',
              count: '$count',
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formattedTrends = trends.map((item) => {
      const incomeData = item.data.find((d) => d.type === 'income') || {
        totalAmount: 0,
        count: 0,
      };
      const expenseData = item.data.find((d) => d.type === 'expense') || {
        totalAmount: 0,
        count: 0,
      };

      return {
        period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        income: incomeData.totalAmount,
        expense: expenseData.totalAmount,
        netBalance: incomeData.totalAmount - expenseData.totalAmount,
        transactionCount: {
          income: incomeData.count,
          expense: expenseData.count,
        },
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedTrends,
    });
  } catch (error) {
    console.error('Monthly trends error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get recent transactions - GLOBAL
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const transactions = await Transaction.find({
      isDeleted: false,
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions },
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};