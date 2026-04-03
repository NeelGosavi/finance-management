import React, { useState } from 'react';
import { createTransaction, updateTransaction } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionForm = ({ transaction, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '',
    type: transaction?.type || 'expense',
    category: transaction?.category || '',
    date: transaction?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    description: transaction?.description || '',
    notes: transaction?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'],
    expense: ['Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Healthcare', 'Shopping', 'Other'],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (transaction) {
        await updateTransaction(transaction._id, formData);
        toast.success('Transaction updated successfully');
      } else {
        await createTransaction(formData);
        toast.success('Transaction created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value, category: '' });
                  }}
                  className="mr-2"
                />
                Income
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value, category: '' });
                  }}
                  className="mr-2"
                />
                Expense
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-field"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              required
              className="input-field"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories[formData.type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <input
              type="text"
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              rows="3"
              className="input-field"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : transaction ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;