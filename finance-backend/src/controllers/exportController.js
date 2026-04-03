// src/controllers/exportController.js
const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');

// Export transactions to CSV (All authenticated users)
exports.exportTransactionsToCSV = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    // Build query - get all transactions (global for all roles)
    const query = { isDeleted: false };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }

    // Fetch transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    if (transactions.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No transactions found to export'
      });
    }

    // Format data for CSV
    const csvData = transactions.map(transaction => ({
      'Date': new Date(transaction.date).toLocaleDateString(),
      'Category': transaction.category,
      'Description': transaction.description || '-',
      'Amount': transaction.amount,
      'Currency': 'USD',
      'Type': transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
      'Created By': transaction.createdBy?.name || 'System',
      'Created At': new Date(transaction.createdAt).toLocaleString()
    }));

    // Define CSV columns
    const fields = [
      'Date',
      'Category',
      'Description',
      'Amount',
      'Currency',
      'Type',
      'Created By',
      'Created At'
    ];

    // Create CSV parser
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Generate filename with date range
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `transactions_export_${dateStr}.csv`;

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    // Send CSV file
    res.status(200).send(csv);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export transactions: ' + error.message
    });
  }
};

// Export dashboard summary to CSV
exports.exportSummaryToCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query
    const matchStage = { isDeleted: false };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    // Get summary data
    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Get category breakdown
    const categories = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    let totalIncome = 0, totalExpense = 0;
    let incomeCount = 0, expenseCount = 0;
    let incomeAvg = 0, expenseAvg = 0;

    summary.forEach(item => {
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

    // Prepare summary CSV data
    const summaryData = [
      { Metric: 'Report Generated', Value: new Date().toLocaleString() },
      { Metric: 'Date Range', Value: `${startDate || 'All'} to ${endDate || 'All'}` },
      { Metric: '', Value: '' },
      { Metric: 'FINANCIAL SUMMARY', Value: '' },
      { Metric: 'Total Income', Value: `$${totalIncome.toLocaleString()}` },
      { Metric: 'Total Expenses', Value: `$${totalExpense.toLocaleString()}` },
      { Metric: 'Net Balance', Value: `$${(totalIncome - totalExpense).toLocaleString()}` },
      { Metric: 'Total Transactions', Value: (incomeCount + expenseCount).toString() },
      { Metric: '', Value: '' },
      { Metric: 'INCOME DETAILS', Value: '' },
      { Metric: 'Total Income Count', Value: incomeCount.toString() },
      { Metric: 'Average Income', Value: `$${incomeAvg.toLocaleString()}` },
      { Metric: '', Value: '' },
      { Metric: 'EXPENSE DETAILS', Value: '' },
      { Metric: 'Total Expense Count', Value: expenseCount.toString() },
      { Metric: 'Average Expense', Value: `$${expenseAvg.toLocaleString()}` },
      { Metric: '', Value: '' },
      { Metric: 'CATEGORY BREAKDOWN', Value: '' },
      { Metric: 'Type', SubMetric: 'Category', SubMetric2: 'Amount', SubMetric3: 'Count' }
    ];

    // Add category breakdown
    categories.forEach(cat => {
      summaryData.push({
        Metric: cat._id.type.toUpperCase(),
        SubMetric: cat._id.category,
        SubMetric2: `$${cat.totalAmount.toLocaleString()}`,
        SubMetric3: cat.count.toString()
      });
    });

    const summaryFields = ['Metric', 'SubMetric', 'SubMetric2', 'SubMetric3'];
    const json2csvParser = new Parser({ fields: summaryFields });
    const csv = json2csvParser.parse(summaryData);

    const filename = `dashboard_summary_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
    
  } catch (error) {
    console.error('Export summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export summary: ' + error.message
    });
  }
};