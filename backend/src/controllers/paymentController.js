const paymentService = require('../services/paymentService');
const { PaymentIntent, Course, Enrollment } = require('../models');
const { Op } = require('sequelize');

/**
 * Create payment intent for course enrollment
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Course ID is required'
      });
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        error: 'Course not available',
        message: 'This course is not published yet'
      });
    }

    // Check if course is free
    if (course.type === 'FREE') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'This course is free. Use enrollment endpoint directly.'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled',
        message: 'You are already enrolled in this course'
      });
    }

    // Check for existing pending payment intent
    const existingIntent = await PaymentIntent.findOne({
      where: {
        userId,
        courseId,
        status: {
          [Op.in]: ['PENDING', 'PROCESSING']
        }
      }
    });

    if (existingIntent) {
      // Return existing intent
      return res.status(200).json({
        success: true,
        message: 'Payment intent already exists',
        data: {
          paymentIntentId: existingIntent.id,
          clientSecret: existingIntent.metadata?.stripeClientSecret,
          amount: parseFloat(existingIntent.amount),
          currency: 'usd'
        }
      });
    }

    // Create payment intent
    const paymentData = await paymentService.createPaymentIntent(
      userId,
      courseId,
      parseFloat(course.price)
    );

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: paymentData
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Verify payment and create enrollment
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.query;
    const userId = req.user.userId;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Payment intent ID is required'
      });
    }

    // Get payment intent
    const paymentIntent = await PaymentIntent.findByPk(paymentIntentId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail', 'version']
        }
      ]
    });

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        error: 'Payment intent not found'
      });
    }

    // Verify ownership
    if (paymentIntent.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this payment intent'
      });
    }

    // Verify payment status with gateway
    const verifiedIntent = await paymentService.verifyPayment(paymentIntentId);

    if (verifiedIntent.status !== 'SUCCEEDED') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
        message: `Payment status: ${verifiedIntent.status}. Please complete the payment first.`,
        data: {
          status: verifiedIntent.status
        }
      });
    }

    // Check if enrollment already exists (prevent duplicates)
    let enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId: paymentIntent.courseId
      }
    });

    if (!enrollment) {
      // Create enrollment
      enrollment = await Enrollment.create({
        userId,
        courseId: paymentIntent.courseId,
        status: 'ACTIVE',
        progress: 0,
        courseVersion: paymentIntent.course.version
      });

      // Fetch with relations
      const enrollmentData = await Enrollment.findByPk(enrollment.id, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'thumbnail']
          }
        ]
      });

      // Send enrollment notification (non-blocking)
      const io = req.app.locals.io;
      const notificationService = require('../services/notificationService');
      notificationService.notifyCourseEnrollment(userId, paymentIntent.course, io).catch(err => {
        console.error('Failed to send enrollment notification:', err);
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and enrollment created successfully',
        data: {
          paymentIntent: verifiedIntent,
          enrollment: enrollmentData
        }
      });
    } else {
      // Enrollment already exists
      return res.status(200).json({
        success: true,
        message: 'Payment verified. You are already enrolled in this course.',
        data: {
          paymentIntent: verifiedIntent,
          enrollment
        }
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Handle payment webhook from Stripe
 */
exports.handleWebhook = async (req, res) => {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      return res.status(500).json({
        error: 'Stripe not configured'
      });
    }

    const stripe = require('stripe')(stripeSecretKey);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      // Verify webhook signature
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // In development, parse without verification (not recommended for production)
        console.warn('[PaymentController] Webhook secret not set, skipping signature verification');
        event = req.body;
      }
    } catch (err) {
      console.error('[PaymentController] Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle webhook event
    const paymentIntent = await paymentService.handleWebhook(event);

    if (paymentIntent && paymentIntent.status === 'SUCCEEDED') {
      // Auto-create enrollment if payment succeeded
      const existingEnrollment = await Enrollment.findOne({
        where: {
          userId: paymentIntent.userId,
          courseId: paymentIntent.courseId
        }
      });

      if (!existingEnrollment) {
        const course = await Course.findByPk(paymentIntent.courseId);
        await Enrollment.create({
          userId: paymentIntent.userId,
          courseId: paymentIntent.courseId,
          status: 'ACTIVE',
          progress: 0,
          courseVersion: course?.version || '1.0'
        });

        // Send notification (non-blocking)
        const io = req.app.locals.io;
        const notificationService = require('../services/notificationService');
        if (course) {
          notificationService.notifyCourseEnrollment(paymentIntent.userId, course, io).catch(err => {
            console.error('Failed to send enrollment notification:', err);
          });
        }
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Handle webhook error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

