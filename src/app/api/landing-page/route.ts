import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Get the active landing page content
    let landingPage = await prisma.landingPage.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // If no landing page exists, create a default one
    if (!landingPage) {
      landingPage = await prisma.landingPage.create({
        data: {
          title: "MoonGazers – Find the Best Stargazing Nights",
          description: "When I first got interested in stargazing, I kept running into the same problem: the weather app told me if it would rain, but not if the sky would actually be good for astronomy. Moon brightness, wind, and timing all matter. That's why I built MoonGazers—a tool that helps anyone plan the perfect night under the stars.",
          imageUrl: "/launch.png",
          imageAlt: "MoonGazers App Preview - Weather, moon, planets, and stars cards",
          buttonText: "Launch MoonGazers App",
          // footerText intentionally omitted - will be undefined/null
          isActive: true
        }
      });
    }

    return NextResponse.json({ success: true, data: landingPage });
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing page content' },
      { status: 500 }
    );
  }
}