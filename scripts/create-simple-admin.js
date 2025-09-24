const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    


    // This script is deprecated - use SQL directly instead
    console.log('⚠️  This script is deprecated.');
    console.log('📝 Create admin users directly in your database using SQL:');
    console.log('');
    console.log('   INSERT INTO users (id, username, password, name)');
    console.log('   VALUES (\'<unique-id>\', \'<your-username>\', \'<your-password>\', \'<your-name>\');');
    console.log('');
    console.log('✅ Use your database management tools instead.');
    return;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();