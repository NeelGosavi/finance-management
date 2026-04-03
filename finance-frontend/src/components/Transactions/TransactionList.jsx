import React, { useState, useEffect } from 'react';
import { getTransactions, deleteTransaction } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import TransactionForm from './TransactionForm';
import TransactionFilters from './TransactionFilters';
import toast from 'react-hot-toast';
import ExportButton from '../Common/ExportButton';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [pagination, setPagination] = useState({});
  const { hasRole, user } = useAuth();

  const canModify = hasRole(['admin', 'analyst']);
  const canDelete = hasRole(['admin']);
  
  // Analysts can only edit their own transactions
  const canEditTransaction = (transaction) => {
    if (hasRole(['admin'])) return true;
    if (hasRole(['analyst']) && transaction.user === user?._id) return true;
    return false;
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions(filters);
      setTransactions(response.data.data.transactions);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        toast.success('Transaction deleted successfully');
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasRole(['admin']) && 'Full access to all transactions'}
            {hasRole(['analyst']) && 'Can create and edit your own transactions'}
            {hasRole(['viewer']) && 'View-only access'}
          </p>
        </div>
        <div className="flex space-x-3">
          <ExportButton 
            type="transactions" 
            filters={filters}
            variant="secondary"
          />
          {canModify && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      </div>

      <TransactionFilters filters={filters} setFilters={setFilters} onFilter={fetchTransactions} />

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleFormClose}
          onSuccess={fetchTransactions}
        />
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span
                      className={
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      ${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {canEditTransaction(transaction) && (
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit transaction"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                      {!canEditTransaction(transaction) && !canDelete && (
                        <span className="text-gray-400" title="View only">
                          <Eye className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
            {canModify && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first transaction →
              </button>
            )}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 flex justify-between items-center border-t">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {filters.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;