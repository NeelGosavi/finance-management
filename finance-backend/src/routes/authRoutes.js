// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, userValidation } = require('../middleware/validation');

router.post('/register', validate(userValidation.register), authController.register);
router.post('/login', validate(userValidation.login), authController.login);
router.get('/me', protect, authController.getMe);
router.patch('/update-password', protect, validate(userValidation.updatePassword), authController.updatePassword);

module.exports = router;