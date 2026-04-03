// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { canManageUsers } = require('../middleware/roleCheck');

// All routes require authentication and admin access
router.use(protect);
router.use(canManageUsers);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;