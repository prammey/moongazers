import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default documentation content as markdown
const DEFAULT_DOCUMENTATION = `# MoonGazers Documentation

## What is MoonGazers?

MoonGazers is an astronomical forecasting application that helps you find the best times for stargazing in your area over the next 72 hours. It analyzes weather patterns, cloud cover, moon phases, and celestial positions to recommend optimal viewing windows.

Unlike standard weather apps that only tell you if it will rain, MoonGazers evaluates all the factors that matter for astronomy: cloud coverage, moon brightness and position, temperature, wind conditions, and visibility of celestial objects.

## How to Use

1. Enter a valid ZIP code (US) or location name in the input field (e.g., "10001" for New York, "Chicago, IL", or "London, UK")
2. Click the submit button (arrow) or press Enter to submit your location
3. View the recommended stargazing windows, sorted from best to acceptable conditions
4. Each window shows a time range when conditions are expected to be favorable
5. Toggle between Fahrenheit/Celsius using the temperature toggle switch
6. Toggle between 12-hour and 24-hour time formats using the time format toggle switch

### Pro Tips:
- The app works best with specific location inputs
- If no results appear, try a nearby location or check back later
- For international locations, include the country name (e.g., "Paris, France")

## Understanding the Results

### Weather Information
- **Temperature:** Average temperature during the viewing window (shown in your preferred unit)
- **Cloud Cover:** Percentage of sky covered by clouds (lower is better for stargazing)
  - No Cloud Coverage: 0-15% (Excellent visibility)
  - Low Cloud Coverage: 16-35% (Good visibility)
  - Medium Cloud Coverage: 36-60% (Fair visibility)
  - High Cloud Coverage: >60% (Poor visibility)
- **Wind Speed:** Average wind in km/h during the window (lower values provide more stable viewing)

### Moon Information
- **Moon Phase:** Current lunar phase (New Moon, Waxing Crescent, First Quarter, etc.)
- **Illumination:** Percentage of the moon's visible disk that is illuminated (0% is new moon, 100% is full moon)
- **Impact on Viewing:** How the moon affects stargazing conditions
  - Low Impact: Moon is dim or below horizon (ideal for deep-sky objects)
  - Medium Impact: Moderate moonlight (still good for brighter objects)
  - High Impact: Bright moonlight may wash out fainter objects

### Celestial Objects
- **Planets:** Lists planets visible during the viewing window
- **Bright Stars:** Notable stars and star clusters visible during the time window

## How It Works

MoonGazers combines data from multiple sources and applies a sophisticated algorithm to identify the best stargazing opportunities:

1. **Location Processing:** Your location is geocoded to precise coordinates using either the US Census Geocoder (for US ZIP codes) or OpenStreetMap's Nominatim service (for international locations).
2. **Weather Analysis:** Using Astrospheric's specialized astronomy weather data (with Open-Meteo as a fallback), the app retrieves hourly forecasts for cloud cover, temperature, and wind speed.
3. **Astronomy Calculations:** The Astronomy Engine library calculates precise moon phases, illumination percentages, and the positions of planets and bright stars for your location.
4. **Scoring Algorithm:** Each hourly slot gets scored based primarily on cloud cover, with additional factors for moon interference and celestial visibility.
5. **Window Grouping:** Adjacent "good" time slots are grouped into viewing windows of at least 90 minutes, then ranked and filtered to show only the best opportunities.

### Scoring Details:
- Base score = 1 - (cloudCover / 100)
- Moon penalty: -0.2 if moon is visible and illumination ≥ 60%
- Only slots with score ≥ 0.6 are considered "good"
- Windows are sorted by average score (descending)

## Data Sources & Disclaimers

### Data Attribution
Forecast data comes from Astrospheric and Open-Meteo; transformed for astronomy use. Star catalog data is derived from astronomical databases of bright stars visible to the naked eye under good viewing conditions.

### Legal Disclaimers
- **Accuracy:** Results are provided "as is" and may be inaccurate or outdated. Weather predictions are inherently uncertain and actual conditions may vary significantly from forecasts.
- **Purpose:** This tool is for educational and informational purposes only and not for operational, commercial, professional, or critical decision-making.
- **Liability:** The creators and operators of MoonGazers assume no responsibility or liability for any errors or omissions in the content provided. The information contained is provided without warranties of any kind.
- **Affiliation:** Not affiliated with or endorsed by Astrospheric, Open-Meteo, US Census Bureau, OpenStreetMap, or any other data providers mentioned.
- **Local Conditions:** Light pollution, local weather patterns, horizon obstructions, and other factors not accounted for in our models may significantly impact actual viewing conditions.
- **Usage:** By using this application, you acknowledge that you do so at your own discretion and risk.

### Privacy Information
Location data entered is used solely for providing forecasts and is not stored permanently. We use minimal cookies necessary for app functionality. No personal information is collected or shared with third parties.

Built with Next.js 15, React, TypeScript, and Tailwind CSS. For questions or concerns about this application, please use the Contact information provided.`;

function isValidToken(token: string): boolean {
  // In production, verify JWT token properly
  return token === process.env.ADMIN_SECRET;
}

// GET - Fetch current documentation
export async function GET() {
  try {
    let documentation = await prisma.documentation.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    // If no documentation exists, create one with default content
    if (!documentation) {
      documentation = await prisma.documentation.create({
        data: {
          title: 'MoonGazers Documentation',
          content: DEFAULT_DOCUMENTATION,
          isActive: true
        }
      });
    }

    return NextResponse.json(documentation);
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    );
  }
}

// PUT - Update documentation (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !isValidToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Set all existing documentation to inactive
    await prisma.documentation.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new active documentation
    const documentation = await prisma.documentation.create({
      data: {
        title,
        content,
        isActive: true
      }
    });

    return NextResponse.json(documentation);
  } catch (error) {
    console.error('Error updating documentation:', error);
    return NextResponse.json(
      { error: 'Failed to update documentation' },
      { status: 500 }
    );
  }
}