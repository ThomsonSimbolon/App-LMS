require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { seed } = require('./src/seeders/seed');

const runSeeders = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Run seeders
    await seed();

    console.log('🎉 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
};

runSeeders();
