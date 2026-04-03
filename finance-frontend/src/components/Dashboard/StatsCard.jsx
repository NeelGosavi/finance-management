import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const StatsCard = ({ title, value, icon, color, trend }) => {
  const getIcon = () => {
    switch (icon) {
      case 'income':
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-6 w-6 text-red-600" />;
      case 'balance':
        return <DollarSign className="h-6 w-6 text-blue-600" />;
      default:
        return <Activity className="h-6 w-6 text-purple-600" />;
    }
  };

  const formatValue = () => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    return value;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{formatValue()}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className="bg-gray-50 p-3 rounded-full">{getIcon()}</div>
      </div>
    </div>
  );
};

export default StatsCard;