import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getCategoryBreakdown, getRecentActivity } from '../../services/api';
import StatsCard from './StatsCard';
import CategoryChart from './CategoryChart';
import RecentTransactions from './RecentTransactions';
import LoadingSpinner from '../Common/LoadingSpinner';
import ExportButton from '../Common/ExportButton';


const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const [summaryRes, categoriesRes, recentRes] = await Promise.all([
        getDashboardSummary(params),
        getCategoryBreakdown(params),
        getRecentActivity({ limit: 5 }),
      ]);

      setSummary(summaryRes.data.data);
      setCategories(categoriesRes.data.data);
      setRecent(recentRes.data.data.transactions);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
        
      <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex space-x-2">
                <ExportButton 
                type="summary" 
                filters={dateRange}
                variant="secondary"
                />
                <div className="flex space-x-2">
                <input
                    type="date"
                    className="input-field w-auto"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <input
                    type="date"
                    className="input-field w-auto"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
                </div>
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Income"
          value={summary?.totalIncome || 0}
          icon="income"
        />
        <StatsCard
          title="Total Expenses"
          value={summary?.totalExpense || 0}
          icon="expense"
        />
        <StatsCard
          title="Net Balance"
          value={summary?.netBalance || 0}
          icon="balance"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categories} />
        <RecentTransactions transactions={recent} />
      </div>
    </div>
  );
};

export default Dashboard;