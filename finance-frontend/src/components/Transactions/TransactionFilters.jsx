import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const TransactionFilters = ({ filters, setFilters, onFilter }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    type: filters.type || '',
    category: filters.category || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
  });

  const applyFilters = () => {
    setFilters({ ...filters, ...localFilters, page: 1 });
    onFilter();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setLocalFilters({ type: '', category: '', startDate: '', endDate: '' });
    setFilters({ page: 1, limit: 10 });
    onFilter();
    setShowFilters(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center space-x-2">
        <Filter className="h-5 w-5" />
        <span>Filters</span>
      </button>

      {showFilters && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg p-4 w-80 z-10 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filter Transactions</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <select
                className="input-field"
                value={localFilters.type}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <input
                type="text"
                className="input-field"
                placeholder="Category"
                value={localFilters.category}
                onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="input-field"
                value={localFilters.endDate}
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button onClick={applyFilters} className="btn-primary flex-1">
                Apply
              </button>
              <button onClick={clearFilters} className="btn-secondary flex-1">
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;