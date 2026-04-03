const Transaction = require('../models/Transaction');

class DashboardService {
  async getDashboardSummary(userId, startDate, endDate) {
    const matchStage = {
      user: userId,
      isDeleted: false,
    };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    const aggregation = await Transaction.aggregate([
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
    
    aggregation.forEach(item => {
      if (item._id === 'income') {
        totalIncome = item.totalAmount;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpense = item.totalAmount;
        expenseCount = item.count;
      }
    });
    
    const netBalance = totalIncome - totalExpense;
    
    return {
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        transactionCount: {
          total: incomeCount + expenseCount,
          income: incomeCount,
          expense: expenseCount,
        },
      },
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };
  }
  
  async getCategoryBreakdown(userId, startDate, endDate) {
    const matchStage = {
      user: userId,
      isDeleted: false,
    };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
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
    ]);
    
    return {
      income: breakdown.find(b => b._id === 'income') || { categories: [], total: 0 },
      expense: breakdown.find(b => b._id === 'expense') || { categories: [], total: 0 },
    };
  }
  
  async getMonthlyTrends(userId, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const trends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
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
    
    return trends.map(item => {
      const incomeData = item.data.find(d => d.type === 'income') || { totalAmount: 0, count: 0 };
      const expenseData = item.data.find(d => d.type === 'expense') || { totalAmount: 0, count: 0 };
      
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
  }
}

module.exports = new DashboardService();