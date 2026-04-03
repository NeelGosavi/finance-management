import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlus, User, Mail, Lock, Eye, EyeOff, AlertCircle, 
  CheckCircle, XCircle, Shield, Briefcase 
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength criteria
  const passwordCriteria = [
    { label: 'At least 6 characters', test: (pwd) => pwd.length >= 6, icon: 'length' },
    { label: 'Contains a number', test: (pwd) => /\d/.test(pwd), icon: 'number' },
    { label: 'Contains a letter', test: (pwd) => /[a-zA-Z]/.test(pwd), icon: 'letter' },
  ];

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/\d/.test(password)) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthPercentage = (passwordStrength / 3) * 100;
  
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'No password';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Medium';
    return 'Strong';
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!/\d/.test(formData.password)) {
        newErrors.password = newErrors.password || '';
        newErrors.password += (newErrors.password ? ', ' : '') + 'Password must contain at least one number';
      }
      if (!/[a-zA-Z]/.test(formData.password)) {
        newErrors.password = newErrors.password || '';
        newErrors.password += (newErrors.password ? ', ' : '') + 'Password must contain at least one letter';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role || !['viewer', 'analyst', 'admin'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ 
        submit: result.error || 'Registration failed. Please try again.' 
      });
    }
  };

  const getRoleDescription = (role) => {
    switch(role) {
      case 'viewer':
        return 'Can only view dashboard data and transactions';
      case 'analyst':
        return 'Can create, view, and analyze transactions';
      case 'admin':
        return 'Full access to manage users and all data';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Finance Dashboard to manage your finances</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                className={`input-field pl-10 ${errors.name && touched.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
              />
            </div>
            {errors.name && touched.name && (
              <div className="mt-1 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              2-50 characters, letters and spaces only
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                className={`input-field pl-10 ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
              />
            </div>
            {errors.email && touched.email && (
              <div className="mt-1 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className={`input-field pl-10 pr-10 ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Password strength: {getStrengthText()}</span>
                  <span className="text-xs text-gray-500">{passwordStrength}/3</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strengthPercentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 space-y-1">
                  {passwordCriteria.map((criterion, index) => {
                    const isMet = criterion.test(formData.password);
                    return (
                      <div key={index} className="flex items-center text-xs">
                        {isMet ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-300 mr-1" />
                        )}
                        <span className={isMet ? 'text-green-600' : 'text-gray-500'}>
                          {criterion.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {errors.password && touched.password && (
              <div className="mt-1 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                className={`input-field pl-10 pr-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <div className="mt-1 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['viewer', 'analyst', 'admin'].map((role) => (
                <label
                  key={role}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all duration-200 ${
                    formData.role === role
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center w-full">
                    <div className={`p-2 rounded-full mb-2 ${
                      formData.role === role ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {role === 'viewer' && <Eye className="h-5 w-5 text-gray-600" />}
                      {role === 'analyst' && <Briefcase className="h-5 w-5 text-gray-600" />}
                      {role === 'admin' && <Shield className="h-5 w-5 text-gray-600" />}
                    </div>
                    <span className={`text-sm font-medium capitalize ${
                      formData.role === role ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {role}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {getRoleDescription(role)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && touched.role && (
              <div className="mt-1 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.role}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;