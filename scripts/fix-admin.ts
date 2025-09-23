import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    console.log('Checking current users...');
    
    // Get all users
    const users = await prisma.user.findMany();
    console.log('Current users:', users);

    // Delete existing admin user if exists
    await prisma.user.deleteMany({
      where: { username: 'admin' }
    });

    console.log('Deleted existing admin user');

    // Hash the password properly
    const hashedPassword = await bcryptjs.hash('admin123', 12);
    console.log('Password hash created');

    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'MoonGazers Admin'
      }
    });

    console.log('✅ Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      name: adminUser.name
    });

    console.log('\n🔑 Admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

    // Test the password hash
    const isValid = await bcryptjs.compare('admin123', hashedPassword);
    console.log('\n🧪 Password hash test:', isValid ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();