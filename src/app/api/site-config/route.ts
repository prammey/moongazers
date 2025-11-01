import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get site config from database
    const config = await prisma.siteConfig.findFirst();
    
    if (!config) {
      // Return default if none exists
      return NextResponse.json({
        showLandingPage: true
      });
    }

    return NextResponse.json({
      showLandingPage: config.showLandingPage
    });
  } catch (error) {
    console.error('Error fetching site config:', error);
    // Return default on error
    return NextResponse.json({
      showLandingPage: true
    });
  }
}