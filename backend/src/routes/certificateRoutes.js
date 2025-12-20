const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken, hasRole } = require('../middleware/auth');

// Public route (no auth)
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);

// Student routes (authenticated)
router.post('/', verifyToken, certificateController.requestCertificate);
router.get('/me', verifyToken, certificateController.getMyCertificates);
router.get('/:id/download', verifyToken, certificateController.downloadCertificate);

// Assessor/Admin routes
router.get('/pending/list', 
  verifyToken, 
  hasRole(['ASSESSOR', 'ADMIN', 'SUPER_ADMIN']), 
  certificateController.getPendingCertificates
);

router.patch('/:id/approve', 
  verifyToken, 
  hasRole(['ASSESSOR', 'ADMIN', 'SUPER_ADMIN']), 
  certificateController.approveCertificate
);

module.exports = router;
