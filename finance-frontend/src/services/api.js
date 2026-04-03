// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');
export const updatePassword = (data) => api.patch('/auth/update-password', data);

// Transaction APIs
export const getTransactions = (params) => api.get('/transactions', { params });
export const createTransaction = (data) => api.post('/transactions', data);
export const updateTransaction = (id, data) => api.patch(`/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getTransactionStats = (params) => api.get('/transactions/stats', { params });

// Dashboard APIs
export const getDashboardSummary = (params) => api.get('/dashboard/summary', { params });
export const getCategoryBreakdown = (params) => api.get('/dashboard/categories', { params });
export const getMonthlyTrends = (params) => api.get('/dashboard/trends', { params });
export const getRecentActivity = (params) => api.get('/dashboard/recent', { params });

// User APIs (Admin only)
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Export APIs (All authenticated users)
export const exportTransactionsToCSV = (params) => {
  return api.get('/export/transactions', { 
    params, 
    responseType: 'blob' 
  });
};

export const exportSummaryToCSV = (params) => {
  return api.get('/export/summary', { 
    params, 
    responseType: 'blob' 
  });
};


export default api;