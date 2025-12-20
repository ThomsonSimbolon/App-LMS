const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, hasRole } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAllCategories);

// Admin only routes
router.post('/', verifyToken, hasRole(['ADMIN', 'SUPER_ADMIN']), categoryController.createCategory);

module.exports = router;
