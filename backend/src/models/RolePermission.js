const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Junction table for many-to-many relationship between Roles and Permissions
const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to roles table'
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to permissions table'
  }
}, {
  tableName: 'role_permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['roleId', 'permissionId']
    }
  ]
});

module.exports = RolePermission;
