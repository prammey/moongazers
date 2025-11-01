import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to validate admin token
function validateToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  if (!validateToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get or create site config
    let config = await prisma.siteConfig.findFirst();
    
    if (!config) {
      // Create default config if none exists
      config = await prisma.siteConfig.create({
        data: {
          showLandingPage: true
        }
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!validateToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { showLandingPage } = body;

    // Get or create site config
    let config = await prisma.siteConfig.findFirst();
    
    if (!config) {
      // Create new config
      config = await prisma.siteConfig.create({
        data: {
          showLandingPage: showLandingPage ?? true
        }
      });
    } else {
      // Update existing config
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          showLandingPage: showLandingPage ?? config.showLandingPage
        }
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { error: 'Failed to update site configuration' },
      { status: 500 }
    );
  }
}