const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Webhook endpoint (no auth required, uses Stripe signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// All other routes require authentication
router.use(verifyToken);

// Create payment intent
router.post('/intent', paymentController.createPaymentIntent);

// Verify payment
router.get('/verify', paymentController.verifyPayment);

module.exports = router;

