// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'viewer',
      status: 'active',
    });

    // Generate token
    const token = signToken(user._id);
    
    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = signToken(user._id);
    
    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: { user: req.user },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    
    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Generate new token
    const token = signToken(user._id);
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      token,
      message: 'Password updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('UpdatePassword error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};