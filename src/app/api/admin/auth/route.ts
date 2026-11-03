import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { createAdminToken } from '../../../../lib/adminSession';

const prisma = new PrismaClient();

function invalidCredentials() {
  return NextResponse.json(
    { success: false, error: 'Invalid credentials' },
    { status: 401 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (typeof username !== 'string' || typeof password !== 'string') {
      return invalidCredentials();
    }

    // Preferred: the admin login set in Vercel (see scripts/set-admin-password.mjs)
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    if (envHash) {
      const isValid =
        username === process.env.ADMIN_USERNAME &&
        (await bcryptjs.compare(password, envHash));
      if (!isValid) return invalidCredentials();

      return NextResponse.json({
        success: true,
        token: createAdminToken(username),
        user: { username }
      });
    }

    // Fallback: users table, bcrypt-hashed passwords only
    const user = await prisma.user.findUnique({
      where: { username }
    });

    const isHashed =
      user?.password.startsWith('$2a$') || user?.password.startsWith('$2b$');
    if (!user || !isHashed || !(await bcryptjs.compare(password, user.password))) {
      return invalidCredentials();
    }

    return NextResponse.json({
      success: true,
      token: createAdminToken(user.username),
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
