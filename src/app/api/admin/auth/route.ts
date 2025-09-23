import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Simple hardcoded authentication for development
    // In production, you should use proper database authentication
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        token: process.env.ADMIN_SECRET,
        user: {
          id: 'admin',
          username: 'admin',
          name: 'MoonGazers Admin'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}