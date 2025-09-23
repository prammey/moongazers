# 🌙 Moongazers

A Next.js 15 web application that helps users find the best moongazing and stargazing times in their area for the next 72 hours.


## Features

- **Location-based forecasting**: Enter a US ZIP code or city name to get personalized stargazing recommendations
- **Weather-aware scoring**: Uses cloud cover, temperature, and wind data to score viewing conditions
- **Astronomical data**: Shows visible planets, bright stars, and moon phase information
- **Optimized time windows**: Groups the best viewing times into 90-minute blocks
- **Responsive design**: Beautiful Tailwind CSS interface with custom color theme (#fff2cc)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with server-side caching
- **APIs**: 
  - Primary: Astrospheric API (weather + sky data)
  - Fallback: Open-Meteo (weather) + Astronomy Engine (sky calculations)
  - Geocoding: US Census Geocoder (free)
  - Timezone: TimeZoneDB
- **Astronomy**: Astronomy Engine library for celestial calculations
- **Data**: Bright stars catalog (CSV) for star visibility

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd moongazers
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
ASTROSPHERIC_KEY=42168ACC7EB4ECD3593C7754E92491C74C499E81F94FFCFB3C3087EA326A8C44524C0FDC
TIMEZONEDB_KEY=7NHWECCR4KQ2
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a US ZIP code or city name (e.g., "60540" or "Naperville, IL")
2. Click "Find Best Times" to get your personalized stargazing forecast
3. View up to 3 optimal viewing windows with:
   - Time ranges and cloud conditions
   - Weather details (temperature, wind)
   - Moon phase and impact on viewing
   - Visible planets and bright stars

## API Endpoints

### POST /api/best-windows

Returns the best moongazing windows for a given location.

**Request Body:**
```json
{
  "location": "60540"
}
```

**Response:**
```json
{
  "location": "Naperville, IL",
  "windows": [
    {
      "start": "Aug 9, 9:15 PM",
      "end": "Aug 9, 11:00 PM", 
      "weather": { "cloud": 12, "temp": 72, "wind": 3 },
      "moon": { "phase": "Waning Crescent", "illum": 18, "impact": "Low" },
      "planets": ["Saturn", "Jupiter"],
      "stars": ["Vega", "Deneb", "Arcturus"]
    }
  ]
}
```

## Scoring Algorithm

The app scores viewing conditions based on:
- **Cloud cover**: Primary factor (lower is better)
- **Moon interference**: Penalty for bright moon (>60% illumination) above horizon
- **Time filtering**: Only considers nighttime hours (sunset+30min to sunrise-30min)
- **Window grouping**: Combines adjacent good hours into 90+ minute blocks

## Caching Strategy

- **Geocoding**: 30 days (locations don't change)
- **Weather forecast**: 6 hours (reasonable freshness)
- **Sky data**: 12 hours (celestial positions change slowly)

## Fallback System

If the primary Astrospheric API fails (timeout >5s or error):
1. Falls back to Open-Meteo for weather data
2. Uses Astronomy Engine for celestial calculations
3. Provides same data structure and user experience

## Development

### Project Structure

```
src/
├── app/
│   ├── api/best-windows/route.ts    # Main API endpoint
│   ├── page.tsx                     # Frontend React component
│   └── globals.css                  # Tailwind styles
├── types/index.ts                   # TypeScript interfaces
└── data/bright_stars.csv            # Star catalog data
```

### Build Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint checking
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **Astrospheric**: Primary weather and sky data provider
- **Open-Meteo**: Free weather API for fallback
- **Astronomy Engine**: Celestial calculations library
- **US Census Bureau**: Free geocoding service
- **TimeZoneDB**: Timezone lookup service
