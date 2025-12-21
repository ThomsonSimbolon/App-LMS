const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'STUDENT', 'ASSESSOR'),
    allowNull: false,
    comment: 'Role name: SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, ASSESSOR'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Role description'
  }
}, {
  tableName: 'roles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name'],
      name: 'roles_name_unique'
    }
  ]
});

module.exports = Role;
