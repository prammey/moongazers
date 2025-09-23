import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcryptjs.hash('admin123', 12);

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'MoonGazers Admin'
      }
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      name: adminUser.name
    });

    console.log('\nAdmin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();