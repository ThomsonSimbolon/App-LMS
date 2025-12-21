const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
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
    comment: 'Foreign key to users'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to courses'
  },
  certificateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Unique certificate number (UUID)'
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'QR code data URL for verification'
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Generated PDF certificate URL'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
    comment: 'Certificate approval status'
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Certificate issue timestamp'
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Approver user ID (assessor/admin)'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Approval timestamp'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for rejection (if rejected)'
  },
  courseVersion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Course version at certificate issuance (for versioning system)'
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['certificateNumber'], name: 'certificates_certificateNumber_unique' },
    { fields: ['userId'] },
    { fields: ['courseId'] },
    { fields: ['userId', 'courseId'] },
    { fields: ['status'] },
    { fields: ['courseVersion'] }
  ]
});

module.exports = Certificate;
