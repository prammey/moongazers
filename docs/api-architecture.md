Moongazers — API Architecture

Overview
--------
This document explains the server-side API used by the Moongazers app, what data is fetched from external providers, how it's processed, cached, and where the results are used in the frontend.

Primary API endpoint
--------------------
- `POST /api/best-windows`
  - Purpose: Accepts a location string (US ZIP or global place), geocodes it to coordinates, fetches weather and sky data, scores candidate night-time windows for stargazing, and returns the best windows and current weather summary.
  - Input: JSON { location: string }
  - Output: JSON {
      location: string, // human-friendly name returned to the UI
      coordinates: { lat: number; lng: number },
      currentWeather?: { temperature: number; cloudCover: number; skyQuality: string },
      windows: Array<{ start: string; end: string; weather: { cloud: number; temp: number; wind: number }; moon: { phase: string; illum: number; impact: string }; planets: string[]; stars: string[] }>
    }

Geocoding
---------
- Providers:
  - US Census geocoder (US ZIP lookup)
  - Nominatim (OpenStreetMap) for international lookups
- Output used from geocoder:
  - Latitude/Longitude
  - Place/address components (city, state, district) which are used to build the `location` string shown to users
- Note: Previously the API appended ZIP and county in parentheses; this was removed for cleaner UI.

Weather data
------------
- Primary provider: Astrospheric (when API key available)
- Fallback: Open-Meteo
- Data requested from Open-Meteo:
  - hourly: `cloudcover`, `temperature_2m`, `wind_speed_10m`
  - daily: `sunrise`, `sunset`
- How cloud cover is used:
  - Each hourly slot includes `cloudCover` (percentage 0-100)
  - When building candidate night windows the API computes an average cloud cover for the window (`avgCloudCover`) and returns it in `weather.cloud`

Sky & astronomical data
-----------------------
- Moon data (phase, illumination) is fetched from the sky provider (Astrospheric or Astronomy Engine fallback) and normalized (illumination clamped to 0-100)
- Planets/stars lists are returned after filtering/visibility computation

Scoring logic
-------------
- Each hourly slot during night gets a base score derived from cloud cover:
  - score = 1 - (cloudCover / 100)
- Moon penalty applies if the moon is visible and bright:
  - if moonVisible && moonIllumination >= 60: score -= 0.2
- Only slots/windows with score >= 0.6 are considered "good" and grouped into time windows for the response

Caching
-------
- Local caching is used to reduce external API calls:
  - Geocoding: cached (long duration)
  - Weather forecasts: cached for shorter durations
  - Sky data: cached appropriately
- Implementation uses Next.js `unstable_cache` with revalidation windows per data type

Frontend usage
--------------
- `src/app/page.tsx` calls `/api/best-windows` and receives the full response
- `src/components/InlineResults.tsx` consumes `windows[]` and:
  - Displays `data.location` in the header
  - For each window, uses `window.weather.cloud` to decide a friendly label (No/Low/Medium/High Cloud Coverage) and show the percentage
  - Uses `window.moon` data to display moon phase, illumination, and impact
  - Renders lists of `planets` and `stars` returned by the API
- `src/components/CurrentWeather.tsx` consumes `currentWeather` (if present) and shows temperature, cloud cover and a short sky-quality string

Error handling & fallbacks
-------------------------
- If Astrospheric fails or returns incomplete data, the API falls back to Open-Meteo + Astronomy Engine calculations
- If geocoding fails, the API attempts the international Nominatim endpoint
- Errors are propagated back with friendly messages which `page.tsx` converts into user-facing text

Data Shapes (TypeScript-friendly)
---------------------------------
- Request: { location: string }
- Response: 
  {
    location: string,
    coordinates: { lat: number, lng: number },
    currentWeather?: { temperature: number, cloudCover: number, skyQuality: string },
    windows: Array<{
      start: string,
      end: string,
      weather: { cloud: number, temp: number, wind: number },
      moon: { phase: string, illum: number, impact: string },
      planets: string[],
      stars: string[]
    }>
  }

Notes for Developers
--------------------
- Keep cloud thresholds consistent between API and UI (e.g., No/Low/Medium/High Cloud Coverage)
- Clamp moon illumination to [0,100] when computing impact
- For reproducible local testing set `NEXT_PUBLIC_BASE_URL` in `.env` and ensure the Astrospheric/TZDB keys are present if testing provider fallbacks

Contact
-------
- For questions about the scoring or data sources, check `src/app/api/best-windows/route.ts` for the current scoring implementation and caching keys.

