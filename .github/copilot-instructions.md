# Moongazers - Stargazing Forecast App

## Architecture Overview
**Next.js 15 App Router** application with server-side API that provides astronomical stargazing forecasts. Core flow: User enters ZIP → Geocode → Fetch weather/astronomy data → Score viewing windows → Return top 3 recommendations.

## Key Components & Data Flow

### Frontend (`src/app/page.tsx`)
- **Single-page app** with ZIP input, toggles (°F/°C, 12hr/24hr), and results display
- **WeatherContext** manages user preferences with localStorage persistence (defaults to Fahrenheit)
- **Conditional rendering**: Shows heading always, loading states, or results based on API state
- **Error handling**: Smart ZIP code validation with user-friendly messages

### API Layer (`src/app/api/best-windows/route.ts`)
- **Multi-step pipeline**: Geocoding → Weather → Sky data → Time window scoring → Response
- **Caching strategy** using `unstable_cache`: Geocoding (30d), Weather (6h), Sky data (12h)
- **Failover system**: Astrospheric API → Open-Meteo + Astronomy Engine fallback
- **International support**: US Census (US ZIP) → OpenStreetMap Nominatim (global)

### Component Architecture
- **CurrentWeather**: Top-left overlay showing current temp/time (uses Kosugi Maru font)
- **ToggleSwitch**: Reusable temperature/time format controls
- **InlineResults**: Main results display with professional minimal styling
- **WeatherContext**: Global state for user preferences with validation

## Development Patterns

### Styling Approach
- **Tailwind CSS 4** with minimal white theme (#ffffff background)
- **Helvetica Neue** font family for consistency across components
- **Professional icons**: Use Unicode symbols (⚠, ✕, ☽, ✦) instead of emojis
- **Shadow styling**: `textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'` for headings

### TypeScript Integration
- **Strict typing** via `src/types/index.ts` for all API interfaces
- **Type guards** for API response validation (hasHourlyData, hasNestedData)
- **Moon illumination clamping**: Always `Math.max(0, Math.min(100, value))` to prevent negative values

### Error Handling Convention
```typescript
// Smart error messages for ZIP codes
if (errorMessage.includes('location not found') || errorMessage.includes('zip')) {
  setError('Please check the provided ZIP code. Make sure it\'s a valid US ZIP code (e.g., 10001 or 90210).');
}
```

### Critical Development Commands
```bash
npm run dev          # Development with Turbopack
npm run build        # Production build with Turbopack  
npm run lint         # ESLint checking
```

## Key Files & Directories
- `src/app/api/best-windows/route.ts` - Main API logic with caching and fallbacks
- `src/contexts/WeatherContext.tsx` - Global state management with localStorage
- `src/types/index.ts` - All TypeScript interfaces and API types
- `data/bright_stars.csv` - Star catalog for visibility calculations
- `public/` - Static assets (letter.png, x.png, coffee.png for footer icons)

## External Dependencies & Integration
- **Astrospheric API**: Primary weather + sky data (requires API key)
- **Open-Meteo**: Free weather fallback (no auth required)
- **US Census Geocoder**: Free ZIP code to coordinates (no auth)
- **TimeZoneDB**: Timezone lookup (requires API key)
- **Astronomy Engine**: Client-side celestial calculations
- **Papa Parse**: CSV processing for star data

## Important Conventions
- **Moon phase calculation**: Use Astronomy Engine with proper clamping for illumination percentage
- **Time window scoring**: Cloud cover primary factor, moon interference penalty at >60% illumination
- **Responsive design**: Mobile-first with sm:, md:, lg: breakpoints
- **Loading states**: Show rotating hourglass (⏳) with 2s animation duration
- **Error styling**: White cards with subtle borders, no harsh red colors
