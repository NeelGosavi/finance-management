import React from 'react';
import { format } from 'date-fns';

const RecentTransactions = ({ transactions }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">{transaction.category}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </p>
                {transaction.description && (
                  <p className="text-xs text-gray-400">{transaction.description}</p>
                )}
              </div>
              <div
                className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}$
                {transaction.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;