const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentIntent = sequelize.define('PaymentIntent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User who initiated the payment'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Course being purchased'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Payment amount'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED'),
    defaultValue: 'PENDING',
    comment: 'Payment status'
  },
  paymentGateway: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'STRIPE',
    comment: 'Payment gateway used (STRIPE, MIDTRANS, etc.)'
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Transaction ID from payment gateway'
  },
  gatewayPaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Payment Intent ID from gateway (e.g., Stripe PaymentIntent ID)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata (gateway response, webhook data, etc.)'
  }
}, {
  tableName: 'payment_intents',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['courseId'] },
    { fields: ['status'] },
    { fields: ['gatewayTransactionId'] },
    { fields: ['gatewayPaymentIntentId'] },
    { fields: ['userId', 'courseId'] },
    { unique: true, fields: ['gatewayPaymentIntentId'], name: 'payment_intents_gatewayPaymentIntentId_unique' }
  ]
});

module.exports = PaymentIntent;

