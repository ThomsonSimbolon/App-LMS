const { Role, Permission, RolePermission } = require('../models');

// Seed roles
const seedRoles = async () => {
  try {
    console.log('🌱 Seeding roles...');

    const roles = [
      { id: 1, name: 'SUPER_ADMIN', description: 'Full system access' },
      { id: 2, name: 'ADMIN', description: 'Manage users, courses, and certificates' },
      { id: 3, name: 'INSTRUCTOR', description: 'Create and manage courses' },
      { id: 4, name: 'STUDENT', description: 'Enroll in courses and take quizzes' },
      { id: 5, name: 'ASSESSOR', description: 'Approve and reject certificates' }
    ];

    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      
      if (created) {
        console.log(`✅ Role created: ${role.name}`);
      } else {
        console.log(`⏭️  Role exists: ${role.name}`);
      }
    }

    console.log('✅ Roles seeding completed');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};

// Seed basic permissions
const seedPermissions = async () => {
  try {
    console.log('🌱 Seeding permissions...');

    const permissions = [
      // Course permissions
      { name: 'create_course', resource: 'course', action: 'create', description: 'Create new courses' },
      { name: 'read_course', resource: 'course', action: 'read', description: 'View courses' },
      { name: 'update_course', resource: 'course', action: 'update', description: 'Update courses' },
      { name: 'delete_course', resource: 'course', action: 'delete', description: 'Delete courses' },
      
      // User permissions
      { name: 'manage_users', resource: 'user', action: 'manage', description: 'Manage user accounts' },
      
      // Enrollment permissions
      { name: 'enroll_course', resource: 'enrollment', action: 'create', description: 'Enroll in courses' },
      
      // Quiz permissions
      { name: 'take_quiz', resource: 'quiz', action: 'take', description: 'Take quizzes' },
      { name: 'create_quiz', resource: 'quiz', action: 'create', description: 'Create quizzes' },
      
      // Certificate permissions
      { name: 'approve_certificate', resource: 'certificate', action: 'approve', description: 'Approve certificates' },
      { name: 'view_certificate', resource: 'certificate', action: 'read', description: 'View certificates' }
    ];

    for (const permData of permissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permData.name },
        defaults: permData
      });
      
      if (created) {
        console.log(`✅ Permission created: ${permission.name}`);
      } else {
        console.log(`⏭️  Permission exists: ${permission.name}`);
      }
    }

    console.log('✅ Permissions seeding completed');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
};

// Seed role-permission mappings
const seedRolePermissions = async () => {
  try {
    console.log('🌱 Seeding role-permission mappings...');

    // Get all roles and permissions
    const roles = await Role.findAll();
    const permissions = await Permission.findAll();

    const roleMap = {};
    roles.forEach(role => { roleMap[role.name] = role.id; });

    const permMap = {};
    permissions.forEach(perm => { permMap[perm.name] = perm.id; });

    // Define mappings
    const mappings = [
      // SUPER_ADMIN - all permissions
      { roleId: roleMap['SUPER_ADMIN'], permissionIds: Object.values(permMap) },
      
      // ADMIN - all except approve certificate
      { roleId: roleMap['ADMIN'], permissionIds: [
        permMap['create_course'],
        permMap['read_course'],
        permMap['update_course'],
        permMap['delete_course'],
        permMap['manage_users'],
        permMap['create_quiz'],
        permMap['view_certificate']
      ]},
      
      // INSTRUCTOR - course and quiz creation
      { roleId: roleMap['INSTRUCTOR'], permissionIds: [
        permMap['create_course'],
        permMap['read_course'],
        permMap['update_course'],
        permMap['create_quiz'],
        permMap['view_certificate']
      ]},
      
      // STUDENT - enroll and take quizzes
      { roleId: roleMap['STUDENT'], permissionIds: [
        permMap['read_course'],
        permMap['enroll_course'],
        permMap['take_quiz'],
        permMap['view_certificate']
      ]},
      
      // ASSESSOR - approve certificates
      { roleId: roleMap['ASSESSOR'], permissionIds: [
        permMap['read_course'],
        permMap['approve_certificate'],
        permMap['view_certificate']
      ]}
    ];

    for (const mapping of mappings) {
      for (const permissionId of mapping.permissionIds) {
        const [rolePerm, created] = await RolePermission.findOrCreate({
          where: {
            roleId: mapping.roleId,
            permissionId: permissionId
          }
        });

        if (created) {
          const role = roles.find(r => r.id === mapping.roleId);
          const perm = permissions.find(p => p.id === permissionId);
          console.log(`✅ Mapped: ${role.name} → ${perm.name}`);
        }
      }
    }

    console.log('✅ Role-permission mappings completed');
  } catch (error) {
    console.error('❌ Error seeding role-permission mappings:', error);
    throw error;
  }
};

// Main seed function
const seed = async () => {
  try {
    console.log('\n🌱 Starting database seeding...\n');
    
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    
    console.log('\n✅ Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  }
};

module.exports = { seed, seedRoles, seedPermissions, seedRolePermissions };
