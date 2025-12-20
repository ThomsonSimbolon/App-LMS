const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// All user routes require authentication
router.use(verifyToken);

// User profile routes
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.put('/me/password', userController.changePassword);
router.delete('/me', userController.deleteAccount);

// Admin only routes
const { hasRole } = require('../middleware/auth');

router.get('/', 
  hasRole(['ADMIN', 'SUPER_ADMIN']), 
  userController.getAllUsers
);

router.get('/:id', 
  hasRole(['ADMIN', 'SUPER_ADMIN']), 
  userController.getUserById
);

router.put('/:id/role', 
  hasRole(['ADMIN', 'SUPER_ADMIN']), 
  userController.updateUserRole
);

router.delete('/:id', 
  hasRole(['ADMIN', 'SUPER_ADMIN']), 
  userController.deleteUser
);

module.exports = router;
