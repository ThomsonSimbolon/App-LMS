const { PaymentIntent, Course } = require('../models');

/**
 * Payment Service
 * 
 * Abstract payment gateway interface with Stripe implementation.
 * Designed to be gateway-agnostic for future extensibility.
 */

/**
 * Create payment intent with Stripe
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @param {number} amount - Payment amount
 * @returns {Promise<Object>} Payment intent with client secret
 */
const createPaymentIntent = async (userId, courseId, amount) => {
  try {
    // Validate course exists and get price
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.type === 'FREE') {
      throw new Error('Cannot create payment intent for free course');
    }

    // Use course price if amount not provided
    const paymentAmount = amount || parseFloat(course.price);

    if (paymentAmount <= 0) {
      throw new Error('Invalid payment amount');
    }

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const stripe = require('stripe')(stripeSecretKey);

    // Create Stripe PaymentIntent
    const stripePaymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: process.env.STRIPE_CURRENCY || 'usd',
      metadata: {
        userId: userId.toString(),
        courseId: courseId.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment intent record in database
    const paymentIntent = await PaymentIntent.create({
      userId,
      courseId,
      amount: paymentAmount,
      status: 'PENDING',
      paymentGateway: 'STRIPE',
      gatewayPaymentIntentId: stripePaymentIntent.id,
      metadata: {
        stripeClientSecret: stripePaymentIntent.client_secret,
        stripePaymentIntentId: stripePaymentIntent.id,
      },
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: stripePaymentIntent.client_secret,
      amount: paymentAmount,
      currency: process.env.STRIPE_CURRENCY || 'usd',
    };
  } catch (error) {
    console.error('[PaymentService] Failed to create payment intent:', error);
    throw error;
  }
};

/**
 * Verify payment status from gateway
 * @param {string} paymentIntentId - Payment intent ID (database ID)
 * @returns {Promise<Object>} Updated payment intent
 */
const verifyPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await PaymentIntent.findByPk(paymentIntentId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'type', 'price'],
        },
      ],
    });

    if (!paymentIntent) {
      throw new Error('Payment intent not found');
    }

    // If already succeeded, return as is
    if (paymentIntent.status === 'SUCCEEDED') {
      return paymentIntent;
    }

    // Verify with Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('Stripe is not configured');
    }

    const stripe = require('stripe')(stripeSecretKey);

    if (!paymentIntent.gatewayPaymentIntentId) {
      throw new Error('Gateway payment intent ID not found');
    }

    const stripePaymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntent.gatewayPaymentIntentId
    );

    // Update payment intent status based on Stripe status
    let newStatus = paymentIntent.status;
    if (stripePaymentIntent.status === 'succeeded') {
      newStatus = 'SUCCEEDED';
    } else if (stripePaymentIntent.status === 'processing') {
      newStatus = 'PROCESSING';
    } else if (stripePaymentIntent.status === 'requires_payment_method' || 
               stripePaymentIntent.status === 'canceled') {
      newStatus = 'FAILED';
    }

    // Update payment intent
    await paymentIntent.update({
      status: newStatus,
      gatewayTransactionId: stripePaymentIntent.latest_charge || null,
      metadata: {
        ...paymentIntent.metadata,
        stripeStatus: stripePaymentIntent.status,
        lastVerified: new Date().toISOString(),
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('[PaymentService] Failed to verify payment:', error);
    throw error;
  }
};

/**
 * Handle webhook from payment gateway
 * @param {Object} event - Webhook event from Stripe
 * @returns {Promise<Object>} Processed payment intent
 */
const handleWebhook = async (event) => {
  try {
    // Handle different event types
    if (event.type === 'payment_intent.succeeded') {
      const stripePaymentIntent = event.data.object;

      // Find payment intent by gateway ID
      const paymentIntent = await PaymentIntent.findOne({
        where: {
          gatewayPaymentIntentId: stripePaymentIntent.id,
        },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title'],
          },
        ],
      });

      if (!paymentIntent) {
        console.warn(`[PaymentService] Payment intent not found for Stripe ID: ${stripePaymentIntent.id}`);
        return null;
      }

      // Update payment intent status (idempotent)
      if (paymentIntent.status !== 'SUCCEEDED') {
        await paymentIntent.update({
          status: 'SUCCEEDED',
          gatewayTransactionId: stripePaymentIntent.latest_charge || null,
          metadata: {
            ...paymentIntent.metadata,
            stripeStatus: stripePaymentIntent.status,
            webhookReceivedAt: new Date().toISOString(),
          },
        });
      }

      return paymentIntent;
    } else if (event.type === 'payment_intent.payment_failed') {
      const stripePaymentIntent = event.data.object;

      const paymentIntent = await PaymentIntent.findOne({
        where: {
          gatewayPaymentIntentId: stripePaymentIntent.id,
        },
      });

      if (paymentIntent && paymentIntent.status !== 'FAILED') {
        await paymentIntent.update({
          status: 'FAILED',
          metadata: {
            ...paymentIntent.metadata,
            stripeStatus: stripePaymentIntent.status,
            failureReason: stripePaymentIntent.last_payment_error?.message || 'Payment failed',
            webhookReceivedAt: new Date().toISOString(),
          },
        });
      }

      return paymentIntent;
    }

    return null;
  } catch (error) {
    console.error('[PaymentService] Failed to handle webhook:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  verifyPayment,
  handleWebhook,
};

