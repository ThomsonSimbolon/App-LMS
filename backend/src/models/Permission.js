const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Permission name (e.g., create_course, manage_users)'
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Resource name (e.g., course, user, quiz)'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Action name (e.g., create, read, update, delete)'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Permission description'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['resource', 'action']
    }
  ]
});

module.exports = Permission;
