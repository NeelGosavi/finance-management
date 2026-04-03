// src/controllers/transactionController.js
const Transaction = require('../models/Transaction');

// Create a new transaction (Analyst & Admin)
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      createdBy: req.user.id, // Track who created it, but everyone can see it
    });

    res.status(201).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get all transactions (All authenticated users - now global)
exports.getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      type,
      category,
      sortBy = '-date',
    } = req.query;

    // Build query - NO user filter anymore!
    const query = { isDeleted: false };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort(sortBy)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: { transactions },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate('createdBy', 'name email');

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Update transaction (Admin only)
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Delete transaction (Admin only)
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get transaction statistics (for dashboard)
exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { isDeleted: false };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    let incomeAvg = 0;
    let expenseAvg = 0;

    stats.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.totalAmount;
        incomeCount = item.count;
        incomeAvg = item.averageAmount;
      } else if (item._id === 'expense') {
        totalExpense = item.totalAmount;
        expenseCount = item.count;
        expenseAvg = item.averageAmount;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        totalTransactions: incomeCount + expenseCount,
        stats: {
          income: {
            total: totalIncome,
            count: incomeCount,
            average: incomeAvg || 0,
          },
          expense: {
            total: totalExpense,
            count: expenseCount,
            average: expenseAvg || 0,
          },
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};