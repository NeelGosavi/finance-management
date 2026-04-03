import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, Receipt, Users, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl text-gray-800">Finance Dashboard</span>
            </Link>
            
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Transactions
              </Link>
              {hasRole(['admin']) && (
                <Link
                  to="/admin/users"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-full ${
                user?.role === 'admin' ? 'bg-red-100' : 
                user?.role === 'analyst' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {user?.role === 'admin' ? (
                  <Shield className="h-4 w-4 text-red-600" />
                ) : (
                  <User className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({user?.role})
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;