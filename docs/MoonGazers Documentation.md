# MoonGazers Documentation

## Overview

MoonGazers is a Next.js 15 application designed to help astronomy enthusiasts find optimal stargazing times based on their location. The app analyzes weather patterns, cloud cover, moon phases, and celestial body positions to recommend the best viewing windows in a 72-hour forecast period.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Frontend Components](#frontend-components)
3. [API Structure](#api-structure)
4. [Data Flow](#data-flow)
5. [User Preferences](#user-preferences)
6. [Algorithms & Calculations](#algorithms--calculations)
7. [Caching Strategy](#caching-strategy)
8. [Error Handling](#error-handling)
9. [Deployment](#deployment)
10. [Development Guide](#development-guide)

## System Architecture

### Core Architecture

MoonGazers is built on Next.js 15 using the App Router architecture, providing a seamless integration between client and server components. The application follows a single-page application pattern with dynamic data loading.

```
Frontend (React/Next.js) ⟶ API Layer (Next.js Route Handlers) ⟶ External APIs
```

### Key Technologies

- **Frontend**: React 18, Next.js 15, TypeScript 5, Tailwind CSS 4
- **Backend**: Next.js Route Handlers (API routes)
- **External APIs**:
  - Astrospheric API (weather + sky data)
  - Open-Meteo (weather fallback)
  - US Census Geocoder (location to coordinates)
  - TimeZoneDB (timezone lookup)
- **Libraries**:
  - Astronomy Engine (celestial calculations)
  - Papa Parse (CSV processing for star data)
  - Luxon (date/time handling)

## Frontend Components

### Page Structure

1. **LandingPage (`src/components/LandingPage.tsx`)**
   - Displays introduction, hero image, and launch button
   - Includes disclaimer about forecast accuracy
   - Manages modal state for enlarged app preview

2. **Main Application (`src/app/page.tsx`)**
   - Handles ZIP code input and form submission
   - Manages loading, error, and result states
   - Orchestrates data fetching from API
   - Contains contact and documentation modals

### UI Components

1. **CurrentWeather (`src/components/CurrentWeather.tsx`)**
   - Displays current temperature and sky conditions
   - Located at the top-left overlay of results view
   - Uses Kosugi Maru font for distinct styling

2. **ToggleSwitch (`src/components/ToggleSwitch.tsx`)**
   - Provides °F/°C temperature unit toggling
   - Provides 12/24 hour time format toggling
   - Manages user preferences with WeatherContext

3. **InlineResults (`src/components/InlineResults.tsx`)**
   - Renders stargazing recommendation cards
   - Shows weather, moon, planets, and stars information
   - Provides visual indicators for cloud cover and moon impact
   - Includes legal disclaimer about data sources

4. **Documentation Dialog**
   - Accessible via "Doc" button in top-right corner
   - Modal dialog with clean white background and border styling
   - Features a closable header with X button and Escape key support
   - Enhanced scrollable content area with custom-styled grey scrollbar
   - All text content displayed in black for optimal readability
   
   **Documentation Dialog Content Sections:**
   - **What is MoonGazers?** - Comprehensive introduction to the application purpose and how it differs from standard weather apps
   - **How to Use** - Detailed step-by-step user instructions with example inputs and "Pro Tips" section in grey highlight
   - **Understanding the Results** - In-depth explanation organized into Weather Information, Moon Information and Celestial Objects subsections with full details on:
     - Cloud cover classifications with percentage ranges
     - Moon phase and illumination impact levels
     - Temperature and wind interpretation
     - Visible planets and stars information
   - **How It Works** - Technical deep-dive into the data processing pipeline with step-by-step explanation:
     - Location processing details
     - Weather data sources
     - Astronomy calculations
     - Scoring algorithm with mathematical formulas
     - Window grouping logic
   - **Data Sources & Disclaimers** - Expanded section with three major components:
     - Data Attribution - Sources of weather and astronomical data
     - Legal Disclaimers - Comprehensive list of limitations, liability statements, and usage terms
     - Privacy Information - How user data is handled and protected

### Styling Approach

- **Tailwind CSS** for utility-first styling
- **Helvetica Neue** font family for consistent typography
- **Minimalist design** with white background (#ffffff)
- **Professional look** with subtle shadows and borders
- **Responsive design** with mobile-first breakpoints

## API Structure

### Main Endpoint

`POST /api/best-windows`

- **Purpose**: Processes location, fetches astronomical and weather data, identifies optimal viewing windows
- **Request**: JSON object with `{ location: string }`
- **Response**: JSON object with location details and viewing windows

### Response Structure

```typescript
{
  location: string,              // Human-readable location
  windows: Array<{              // Array of optimal viewing windows
    start: string,              // ISO timestamp for window start
    end: string,                // ISO timestamp for window end
    weather: {                  // Weather conditions during window
      cloud: number,            // Average cloud cover percentage
      temp: number,             // Temperature in Celsius
      wind: number              // Wind speed in km/h
    },
    moon: {                     // Moon data
      phase: string,            // Moon phase name
      illum: number,            // Illumination percentage
      impact: "Low"|"Medium"|"High" // Impact on visibility
    },
    planets: string[],          // Visible planets
    stars: string[]             // Visible bright stars
  }>,
  currentWeather?: {            // Current conditions (if available)
    temperature: number,        // Temperature in Celsius
    cloudCover: number,         // Current cloud cover percentage
    skyQuality: string          // Human-readable sky quality description
  }
}
```

## Data Flow

1. **User Input**: ZIP code or location name submitted
2. **Geocoding Pipeline**:
   - Analyze input format (US ZIP, Canadian/UK postal code, or general location)
   - Primary: US Census Geocoder API for US ZIPs
   - Fallback: Nominatim (OpenStreetMap) for international locations
   - Extract coordinates and formatted location name

3. **Weather Data Retrieval**:
   - Primary: Astrospheric API
   - Fallback: Open-Meteo API
   - Fetch hourly forecast (cloud cover, temperature, wind)
   - Fetch sunrise/sunset times for night period determination

4. **Astronomical Data Processing**:
   - Get moon phase and illumination percentage
   - Calculate visible planets based on position and brightness
   - Filter bright stars catalog for visibility

5. **Window Scoring and Grouping**:
   - Score each hourly timeslot based on viewing conditions
   - Group adjacent "good" slots into viewing windows (≥90 minutes)
   - Apply moon impact penalty for bright moon periods
   - Sort and select top 3 windows for display

6. **Response Formatting**:
   - Convert timestamps to user's timezone
   - Format data for frontend display
   - Include current conditions if available

## User Preferences

The application manages user preferences through the WeatherContext:

1. **Temperature Unit**:
   - Toggle between Celsius (°C) and Fahrenheit (°F)
   - Default: Celsius
   - Persisted in localStorage

2. **Time Format**:
   - Toggle between 12-hour and 24-hour format
   - Default: 12-hour format
   - Persisted in localStorage

Functions provided by WeatherContext:
- `toggleTemperatureUnit()`: Switch between units
- `toggleTimeFormat()`: Switch between time formats
- `convertTemperature()`: Convert values between temperature units
- `formatTemperature()`: Format temperature with proper unit
- `formatTime()`: Format time according to user preference

## Algorithms & Calculations

### Window Scoring Algorithm

1. **Base Score Calculation**:
   ```javascript
   baseScore = 1 - (cloudCover / 100)
   ```

2. **Moon Impact Penalty**:
   ```javascript
   if (moonVisible && moonIllumination >= 60) {
     score -= 0.2;
   }
   ```

3. **Window Selection**:
   - Only slots with score ≥ 0.6 are considered "good"
   - Adjacent good slots are grouped into windows (≥90 minutes)
   - Windows are sorted by average score (descending)
   - Top 3 windows are returned

### Cloud Coverage Classification

```javascript
if (cloudCover <= 15) return "No Cloud Coverage";
if (cloudCover <= 35) return "Low Cloud Coverage";
if (cloudCover <= 60) return "Medium Cloud Coverage";
return "High Cloud Coverage";
```

### Moon Impact Classification

```javascript
if (illumination < 30) return "Low";
if (illumination < 70) return "Medium";
return "High";
```

## Caching Strategy

The application implements a multi-tier caching strategy to minimize API calls and improve performance:

1. **Geocoding Cache**: 30 days
   - Locations rarely change, safe for long-term caching
   - Implemented with `unstable_cache` using 'geocode-v2' key

2. **Weather Forecast Cache**: 6 hours
   - Weather forecasts update regularly but remain valid for several hours
   - Separate caching for Astrospheric and Open-Meteo providers

3. **Sky Data Cache**: 12 hours
   - Celestial positions change slowly
   - Includes moon phase, illumination, and visible celestial bodies

## Error Handling

1. **API Errors**:
   - Graceful degradation from primary to fallback providers
   - Standardized error response format with meaningful messages
   - Timeout handling for slow external APIs (>5s)

2. **Geocoding Errors**:
   - Special handling for invalid ZIP codes
   - International location fallback
   - User-friendly error messages for location input issues

3. **Frontend Error Display**:
   - Clean error cards with contextual messages
   - Retry functionality for transient errors
   - Special handling for common error cases (invalid ZIP, no internet)

## Deployment

### Environment Variables

Required for full functionality:
```
ASTROSPHERIC_KEY=your_api_key
TIMEZONEDB_KEY=your_api_key
```

Optional for development:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Build and Deployment Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Production server
npm run start

# Linting
npm run lint
```

## Development Guide

### Project Structure

```
moongazers/
├── data/                      # Data files
│   └── bright_stars.csv       # Star catalog
├── docs/                      # Documentation
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   └── best-windows/  # Main API endpoint
│   │   ├── page.tsx           # Main page component
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   └── types/                 # TypeScript types
├── package.json               # Dependencies
└── next.config.ts             # Next.js configuration
```

### Adding New Features

1. **New Weather Data Source**:
   - Add API client in the main route handler
   - Implement proper type conversion to match existing types
   - Add to the provider fallback chain

2. **New UI Component**:
   - Follow the existing component pattern
   - Use Tailwind for styling
   - Maintain responsive design principles
   - Update TypeScript types as needed

3. **Extending Star/Planet Data**:
   - Update the bright_stars.csv with new entries
   - Modify the filtering logic in the sky data processing

### Testing

The application can be tested with different scenarios:
- Various locations (US ZIP, international city names)
- Different weather conditions
- API fallback scenarios
- Mobile and desktop viewport testing

## Additional Resources

- **Astronomy Engine Documentation**: Refer to npm package for celestial calculations
- **Next.js Documentation**: For App Router and API routes
- **Tailwind Documentation**: For styling utilities

---

*This documentation is a comprehensive guide for developers working with the MoonGazers application. For user-facing documentation, refer to the in-app help section.*