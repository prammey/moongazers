/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import Papa from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';
import { DateTime } from 'luxon';
import * as astronomy from 'astronomy-engine';
import {
  BestWindowsResponse,
  Coordinates,
  TimeWindow,
  BrightStar,
  TimeSlot,
  GroupedWindow,
  OpenMeteoForecast,
  MoonData
} from '@/types';

const TIMEZONEDB_KEY = process.env.TIMEZONEDB_KEY;

// Validate environment variables
if (!TIMEZONEDB_KEY) {
  console.warn('[API] Warning: TIMEZONEDB_KEY not found in environment variables');
}

// Cache functions
const getCachedGeocode = unstable_cache(
  async (location: string) => await geocodeLocation(location),
  ['geocode-v3'], // bumped: ZIPs are now looked up as postcodes
  { revalidate: 60 * 60 * 24 * 30 } // 30 days
);

const getCachedForecast = unstable_cache(
  async (lat: number, lng: number) => await getOpenMeteoForecast(lat, lng),
  ['forecast'],
  { revalidate: 60 * 60 * 6 } // 6 hours
);

// A place's time zone doesn't change; cache it like geocoding
const getCachedTimezone = unstable_cache(
  async (lat: number, lng: number) => await getTimezone(lat, lng),
  ['timezone'],
  { revalidate: 60 * 60 * 24 * 30 } // 30 days
);

const getCachedSkyData = unstable_cache(
  async (lat: number, lng: number, dateTime: string) => await getSkyData(lat, lng, dateTime),
  ['sky-v2'], // bumped: real moon/planet/star positions
  { revalidate: 60 * 60 * 12 } // 12 hours
);

// Bad input from the visitor (shown to them as a 400)
class BadInputError extends Error {}
// A weather/location service failed (shown as a 502)
class UpstreamError extends Error {}

// Geocoding with international support including Canada
async function geocodeLocation(location: string): Promise<{ coordinates: Coordinates; location: string }> {
  const trimmedLocation = location.trim();
  
  // Helper function to detect location type
  const detectLocationType = (loc: string) => {
    // US ZIP codes (5 digits or 5+4 format)
    if (/^\d{5}(-\d{4})?$/.test(loc)) return 'us_zip';
    
    // Canadian postal codes (A1A 1A1 or A1A1A1 format)
    if (/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(loc)) return 'ca_postal';
    
    // UK postcodes (various formats)
    if (/^[A-Za-z]{1,2}\d{1,2}[A-Za-z]?\s?\d[A-Za-z]{2}$/.test(loc)) return 'uk_postal';
    
    // General location (city, address, etc.)
    return 'general';
  };

  const locationType = detectLocationType(trimmedLocation);
  console.log(`[Geocoding] Detected location type: ${locationType} for "${trimmedLocation}"`);

  // International geocoding using OpenStreetMap Nominatim (supports all countries)
  console.log('[Geocoding] Using international OpenStreetMap geocoding...');
  
  // Build search query based on location type
  let searchQuery = trimmedLocation;
  let countryHint = '';
  
  switch (locationType) {
    case 'ca_postal':
      // Add Canada hint for postal codes
      searchQuery = trimmedLocation + ', Canada';
      countryHint = '&countrycodes=ca';
      break;
    case 'uk_postal':
      // Add UK hint for postcodes
      searchQuery = trimmedLocation + ', United Kingdom';
      countryHint = '&countrycodes=gb';
      break;
    case 'us_zip':
      // Add USA hint for ZIP codes
      searchQuery = trimmedLocation + ', USA';
      countryHint = '&countrycodes=us';
      break;
    default:
      // For general locations, let Nominatim search globally
      searchQuery = trimmedLocation;
      countryHint = '';
      break;
  }

  // A US ZIP is searched as a postcode only: as free text, an unknown ZIP
  // like "00000" matched a random bus stop in Belleville, IL.
  const queryPart = locationType === 'us_zip'
    ? `postalcode=${encodeURIComponent(trimmedLocation.slice(0, 5))}`
    : `q=${encodeURIComponent(searchQuery)}`;
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&${queryPart}${countryHint}&addressdetails=1`;
  
  let nominatimResponse: Response;
  try {
    nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Moongazers-App/1.0',
        // English place names ("Tokyo, Japan", not "東京都, 日本")
        'Accept-Language': 'en'
      }
    });
  } catch (error) {
    console.error('[Geocoding] Nominatim error:', error);
    throw new UpstreamError('The location service is not responding. Please try again in a minute.');
  }

  if (nominatimResponse.ok) {
    const nominatimData = await nominatimResponse.json();
    
    if (nominatimData.length > 0) {
      const place = nominatimData[0];
      
      // Build a detailed location name with district info
      let locationName = place.display_name;
      if (place.address) {
        const addr = place.address;
        const parts = [];
        const details = [];
        
        // Add district/neighborhood info
        if (addr.suburb) details.push(`[Suburb: ${addr.suburb}]`);
        else if (addr.neighbourhood) details.push(`[Neighborhood: ${addr.neighbourhood}]`);
        else if (addr.district) details.push(`[District: ${addr.district}]`);
        else if (addr.quarter) details.push(`[Quarter: ${addr.quarter}]`);
        
        // Add city/town/village
        if (addr.city) parts.push(addr.city);
        else if (addr.town) parts.push(addr.town);
        else if (addr.village) parts.push(addr.village);
        else if (addr.municipality) parts.push(addr.municipality);
        
        // Add state/province
        if (addr.state) parts.push(addr.state);
        else if (addr.province) parts.push(addr.province);
        else if (addr.region) parts.push(addr.region);
        
        // Add country
        if (addr.country) parts.push(addr.country);
        
        // Build the final location string
        if (parts.length > 0) {
          locationName = parts.join(', ');
          
          // Add detailed info if available
          if (details.length > 0) {
            locationName = `${locationName} (${details.join(' • ')})`;
          }
        }
        
        console.log('[Geocoding] Built detailed location:', locationName);
      }
      
      return {
        coordinates: {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        },
        location: locationName
      };
    }
  } else {
    throw new UpstreamError('The location service is busy. Please try again in a minute.');
  }

  throw new BadInputError(
    `We couldn't find "${trimmedLocation}". Try a US ZIP code (e.g. 10001), a Canadian postal code (e.g. M5H 2N2), or a city name (e.g. Paris, France).`
  );
}

// Get timezone using TimeZoneDB with intelligent fallbacks
async function getTimezone(lat: number, lng: number): Promise<string> {
  // No key (e.g. local dev): skip the call, it can only fail
  if (TIMEZONEDB_KEY) {
    try {
      const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_KEY}&format=json&lat=${lat}&lng=${lng}`;
    
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.zoneName) {
          console.log(`[Timezone] Found timezone: ${data.zoneName}`);
          return data.zoneName;
        }
      }
    } catch (error) {
      console.log('[Timezone] TimeZoneDB failed, using fallback logic:', error);
    }
  }

  // Intelligent fallback based on coordinates
  console.log(`[Timezone] Using coordinate-based fallback for lat: ${lat}, lng: ${lng}`);
  
  // North America
  if (lat >= 25 && lat <= 71 && lng >= -180 && lng <= -50) {
    if (lng >= -75) return 'America/New_York';      // Eastern
    if (lng >= -90) return 'America/Chicago';       // Central  
    if (lng >= -105) return 'America/Denver';       // Mountain
    if (lng >= -125) return 'America/Los_Angeles';  // Pacific
    return 'America/Anchorage';                     // Alaska/Western
  }
  
  // Europe
  if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) {
    if (lng <= 15) return 'Europe/London';          // Western Europe
    if (lng <= 30) return 'Europe/Berlin';          // Central Europe
    return 'Europe/Helsinki';                       // Eastern Europe
  }
  
  // Asia-Pacific
  if (lat >= -50 && lat <= 70 && lng >= 60 && lng <= 180) {
    if (lng <= 90) return 'Asia/Kolkata';           // South/Central Asia
    if (lng <= 120) return 'Asia/Shanghai';         // East Asia
    if (lng <= 150) return 'Asia/Tokyo';            // Far East Asia
    return 'Pacific/Auckland';                      // Pacific
  }
  
  // Australia/Oceania
  if (lat >= -50 && lat <= -10 && lng >= 110 && lng <= 180) {
    return 'Australia/Sydney';
  }
  
  // South America
  if (lat >= -60 && lat <= 15 && lng >= -85 && lng <= -30) {
    return 'America/Sao_Paulo';
  }
  
  // Africa
  if (lat >= -35 && lat <= 40 && lng >= -20 && lng <= 55) {
    return 'Africa/Johannesburg';
  }
  
  // Default fallback to UTC
  console.log('[Timezone] No specific region match, defaulting to UTC');
  return 'UTC';
}

// Open-Meteo hourly forecast (the only forecast source)
async function getOpenMeteoForecast(lat: number, lng: number): Promise<OpenMeteoForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=cloudcover,temperature_2m,wind_speed_10m&daily=sunrise,sunset&timezone=auto&forecast_days=4`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }
  
  return await response.json();
}

// Sky data calculated with Astronomy Engine for this place and moment.
// (It used to return placeholders: always Jupiter + Saturn, the first five
// stars in the CSV, and a moon phase read in the wrong units, so every night
// said "Waning Crescent, 0%".)
const NAKED_EYE_PLANETS = [
  astronomy.Body.Mercury,
  astronomy.Body.Venus,
  astronomy.Body.Mars,
  astronomy.Body.Jupiter,
  astronomy.Body.Saturn,
];
// Lower objects sit in haze and behind trees/buildings
const MIN_PLANET_ALTITUDE = 5;
const MIN_STAR_ALTITUDE = 10;

async function getSkyData(lat: number, lng: number, dateTime: string) {
  // dateTime is a UTC timestamp without the trailing "Z"; read it as UTC
  const date = new Date(dateTime.endsWith('Z') ? dateTime : `${dateTime}Z`);
  const observer = new astronomy.Observer(lat, lng, 0);

  const altitudeOf = (body: astronomy.Body) => {
    const equ = astronomy.Equator(body, date, observer, true, true);
    return astronomy.Horizon(date, observer, equ.ra, equ.dec, 'normal').altitude;
  };

  // MoonPhase is the Moon-Sun angle in degrees: 0 new, 90 first quarter, 180 full
  const moonPhase = astronomy.MoonPhase(date) / 360;
  const moonIllumination = Math.round(
    astronomy.Illumination(astronomy.Body.Moon, date).phase_fraction * 100
  );

  const planets = NAKED_EYE_PLANETS
    .filter((body) => altitudeOf(body) > MIN_PLANET_ALTITUDE)
    .map((body) => String(body));

  // The five brightest naked-eye stars above the horizon right then
  const brightStars = await getBrightStars();
  const visibleStars: string[] = brightStars
    .filter((star) => star.mag <= 2.0)
    .filter((star) => astronomy.Horizon(date, observer, star.ra, star.dec, 'normal').altitude > MIN_STAR_ALTITUDE)
    .sort((x, y) => x.mag - y.mag)
    .slice(0, 5)
    .map((star) => star.name);

  return {
    moon: {
      phase: getMoonPhaseName(moonPhase),
      illumination: moonIllumination,
      altitude: altitudeOf(astronomy.Body.Moon)
    },
    planets,
    stars: visibleStars
  };
}

// Get bright stars from CSV
async function getBrightStars(): Promise<BrightStar[]> {
  const csvPath = path.join(process.cwd(), 'data', 'bright_stars.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  return new Promise((resolve) => {
    Papa.parse(csvContent, {
      header: true,
      complete: (results) => {
        const stars = results.data
          .filter((row): row is Record<string, string> => 
            typeof row === 'object' && row !== null && 
            'name' in row && 'ra' in row && 'dec' in row && 'mag' in row
          )
          .map((row) => ({
            name: row.name,
            ra: parseFloat(row.ra),
            dec: parseFloat(row.dec),
            mag: parseFloat(row.mag)
          }));
        resolve(stars);
      }
    });
  });
}

// Helper functions
function getMoonPhaseName(phase: number): string {
  if (phase < 0.0625) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Last Quarter';
  return 'Waning Crescent';
}

function getMoonImpact(illumination: number, isVisible: boolean): 'Low' | 'Medium' | 'High' {
  if (!isVisible || illumination < 30) return 'Low';
  if (illumination < 60) return 'Medium';
  return 'High';
}

function scoreTimeSlot(cloudCover: number, moonIllumination: number, moonVisible: boolean): number {
  let score = 1 - (cloudCover / 100);
  
  // Moon penalty
  if (moonVisible && moonIllumination >= 60) {
    score -= 0.2;
  }
  
  return Math.max(0, score);
}

function groupTimeWindows(slots: TimeSlot[]): GroupedWindow[] {
  const goodSlots = slots.filter(slot => slot.score >= 0.6);
  const windows: GroupedWindow[] = [];
  
  let currentWindow: TimeSlot[] = [];
  
  for (const slot of goodSlots) {
    if (currentWindow.length === 0) {
      currentWindow = [slot];
    } else {
      const lastSlot = currentWindow[currentWindow.length - 1];
      const timeDiff = slot.time.getTime() - lastSlot.time.getTime();
      
      // If slots are within 2 hours, group them
      if (timeDiff <= 2 * 60 * 60 * 1000) {
        currentWindow.push(slot);
      } else {
        // Finalize current window if it's at least 90 minutes
        if (currentWindow.length >= 2) {
          const startTime = currentWindow[0].time;
          const endTime = new Date(currentWindow[currentWindow.length - 1].time.getTime() + 60 * 60000);
          const avgScore = currentWindow.reduce((sum, s) => sum + s.score, 0) / currentWindow.length;
          
          windows.push({
            startTime,
            endTime,
            avgScore,
            slots: currentWindow
          });
        }
        currentWindow = [slot];
      }
    }
  }
  
  // Handle last window
  if (currentWindow.length >= 2) {
    const startTime = currentWindow[0].time;
    const endTime = new Date(currentWindow[currentWindow.length - 1].time.getTime() + 60 * 60000);
    const avgScore = currentWindow.reduce((sum, s) => sum + s.score, 0) / currentWindow.length;
    
    windows.push({
      startTime,
      endTime,
      avgScore,
      slots: currentWindow
    });
  }
  
  return windows.sort((a, b) => b.avgScore - a.avgScore).slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Send JSON like {"location": "10001"}' }, { status: 400 });
    }
    const location = (body as { location?: unknown } | null)?.location;
    
    if (typeof location !== 'string' || !location.trim()) {
      return NextResponse.json({ error: 'Please enter a ZIP code, postal code or city.' }, { status: 400 });
    }
    if (location.trim().length > 100) {
      return NextResponse.json({ error: 'That location is too long. Try a ZIP code or a city name.' }, { status: 400 });
    }
    
    console.log(`[API] Processing request for location: ${location}`);
    
    // Step 1: Geocode location
    const { coordinates, location: formattedLocation } = await getCachedGeocode(location.trim());
    const { lat, lng } = coordinates;
    
    console.log(`[API] Coordinates: ${lat}, ${lng}`);
    
    // Step 2: Get timezone
    const timezone = await getCachedTimezone(lat, lng);
    console.log(`[API] Timezone: ${timezone}`);
    
    // Step 3: Open-Meteo forecast
    let forecastData: OpenMeteoForecast;
    try {
      forecastData = await getCachedForecast(lat, lng);
    } catch (error) {
      console.error('[API] Open-Meteo failed:', error);
      throw new UpstreamError('The weather service is not responding. Please try again in a minute.');
    }
    
    // Step 4: Process forecast data and score time slots
    const timeSlots: TimeSlot[] = [];
    
    if (typeof forecastData !== 'object' || forecastData === null || !('hourly' in forecastData)) {
      throw new Error('Invalid forecast data structure');
    }
    const hourlyData = forecastData.hourly;

    // Open-Meteo (timezone=auto) returns wall-clock times in the location's
    // own zone with no offset, e.g. "2026-10-04T21:00" = 9 PM in Naperville.
    // Interpret them in that zone. `new Date()` read them in the server's zone
    // (UTC on Vercel), which shifted every window by the location's UTC offset.
    const forecastZone = (forecastData as Partial<OpenMeteoForecast>)?.timezone;
    const locationZone =
      forecastZone && DateTime.now().setZone(forecastZone).isValid ? forecastZone : timezone;
    const now = DateTime.now().setZone(locationZone);
    
    for (let i = 0; i < hourlyData.time.length; i++) {
      const localTime = DateTime.fromISO(hourlyData.time[i], { zone: locationZone });
      const time = localTime.toJSDate();
      // ?? not ||: a real 0 °C or 0 km/h must not become the default
      const cloudCover = hourlyData.cloudcover[i] ?? 0;
      const temperature = hourlyData.temperature_2m[i] ?? 10;
      const windSpeed = hourlyData.wind_speed_10m[i] ?? 5;

      // Skip hours that are already over (forecast starts at local midnight today)
      if (localTime.plus({ hours: 1 }) <= now) continue;
      
      // Determine if it's optimal stargazing time (9 PM to 4:30 AM only)
      // Moon and stars are not visible during daylight hours after 4:30 AM
      // Time window: 21:00-04:30 for best astronomical visibility, in the
      // location's local time (not the server's)
      const hour = localTime.hour;
      const minute = localTime.minute;
      const isOptimalTime = hour >= 21 || (hour < 4) || (hour === 4 && minute <= 30);
      
      if (isOptimalTime) {
        const score = scoreTimeSlot(cloudCover, 0, false); // Simplified for now
        
        timeSlots.push({
          time,
          cloudCover,
          temperature,
          windSpeed,
          score,
          isNight: isOptimalTime
        });
      }
    }
    
    // Step 5: Group into windows
    const windows = groupTimeWindows(timeSlots);
    
    // Step 6: Get sky data for each window
    const timeWindows: TimeWindow[] = [];
    
    for (const window of windows) {
      const midpoint = new Date((window.startTime.getTime() + window.endTime.getTime()) / 2);
      const dateTimeStr = midpoint.toISOString().slice(0, 19);
      
      const skyData: unknown = await getCachedSkyData(lat, lng, dateTimeStr);
      
      // Calculate average weather for the window
      const avgCloudCover = Math.round(window.slots.reduce((sum, s) => sum + s.cloudCover, 0) / window.slots.length);
      const avgTemp = Math.round(window.slots.reduce((sum, s) => sum + s.temperature, 0) / window.slots.length);
      const avgWind = Math.round(window.slots.reduce((sum, s) => sum + s.windSpeed, 0) / window.slots.length);
      
      // Format moon data
      const moonData: MoonData = {
        phase: (skyData as any).moon?.phase || 'Unknown',
        illum: Math.max(0, Math.min(100, (skyData as any).moon?.illumination || 0)),
        impact: getMoonImpact(Math.max(0, Math.min(100, (skyData as any).moon?.illumination || 0)), ((skyData as any).moon?.altitude || 0) > 0)
      };
      
      // Return ISO timestamp strings for frontend formatting
      const startStr = window.startTime.toISOString();
      const endStr = window.endTime.toISOString();
      
      timeWindows.push({
        start: startStr,
        end: endStr,
        weather: {
          cloud: avgCloudCover,
          temp: avgTemp,
          wind: avgWind
        },
        moon: moonData,
        planets: (skyData as any).planets || [],
        stars: (skyData as any).stars || []
      });
    }
    
    // Get current weather data
    let currentWeather = null;
    
    if (hourlyData && hourlyData.time.length > 0) {
      // Find the current hour in the location's zone (forecast times are local there)
      const currentHour = now.toFormat('yyyy-MM-dd\'T\'HH:00');
      const currentIndex = hourlyData.time.findIndex(time => time === currentHour);
      
      if (currentIndex >= 0) {
        const currentTemp = hourlyData.temperature_2m[currentIndex];
        const currentCloud = hourlyData.cloudcover[currentIndex];
        
        let skyQuality = 'No Cloud Coverage';
        if (currentCloud > 15) skyQuality = 'Low Cloud Coverage';
        if (currentCloud > 35) skyQuality = 'Medium Cloud Coverage';
        if (currentCloud > 60) skyQuality = 'High Cloud Coverage';
        
        currentWeather = {
          temperature: currentTemp,
          cloudCover: currentCloud,
          skyQuality: skyQuality
        };
      }
    }

    const response: BestWindowsResponse = {
      location: formattedLocation,
      timezone: locationZone,
      windows: timeWindows,
      currentWeather: currentWeather
    };
    
    console.log(`[API] Returning ${timeWindows.length} windows`);
    return NextResponse.json(response);
    
  } catch (error) {
    if (error instanceof BadInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof UpstreamError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while building your forecast. Please try again.' },
      { status: 500 }
    );
  }
}
