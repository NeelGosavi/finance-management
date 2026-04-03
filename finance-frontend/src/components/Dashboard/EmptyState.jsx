import React from 'react';
import { Eye, AlertCircle, Mail } from 'lucide-react';

const EmptyState = ({ role }) => {
  if (role === 'viewer') {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-gray-100 rounded-full p-4">
            <Eye className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">View-Only Access</h2>
          <p className="text-gray-600 max-w-md">
            You have viewer permissions. Your dashboard will show data once transactions are added by an analyst or administrator.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-md">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">What can you do?</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>✓ View all transactions</li>
                  <li>✓ View dashboard analytics</li>
                  <li>✓ Export reports (coming soon)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2 max-w-md">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800">Need transactions?</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Contact an administrator or request analyst access to add your own transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default EmptyState;