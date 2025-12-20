const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'User email address (unique)'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Hashed password (bcrypt)'
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'User first name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'User last name'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    },
    comment: 'Foreign key to roles table'
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Email verification status'
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token for email verification'
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Email verification token expiration'
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token for password reset'
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Password reset token expiration'
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JWT refresh token'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last login timestamp'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Account active status'
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['roleId']
    },
    {
      fields: ['isEmailVerified']
    }
  ]
});

module.exports = User;
