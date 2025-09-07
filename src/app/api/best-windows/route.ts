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

const ASTROSPHERIC_KEY = process.env.ASTROSPHERIC_KEY;
const TIMEZONEDB_KEY = process.env.TIMEZONEDB_KEY;

// Cache functions
const getCachedGeocode = unstable_cache(
  async (location: string) => await geocodeLocation(location),
  ['geocode'],
  { revalidate: 60 * 60 * 24 * 30 } // 30 days
);

const getCachedForecast = unstable_cache(
  async (lat: number, lng: number, provider: string) => {
    if (provider === 'astrospheric') {
      return await getAstrosphericForecast(lat, lng);
    }
    return await getOpenMeteoForecast(lat, lng);
  },
  ['forecast'],
  { revalidate: 60 * 60 * 6 } // 6 hours
);

const getCachedSkyData = unstable_cache(
  async (lat: number, lng: number, dateTime: string, timezone: string, provider: string) => {
    if (provider === 'astrospheric') {
      return await getAstrosphericSkyData(lat, lng, dateTime, timezone);
    }
    return await getFallbackSkyData(lat, lng, dateTime);
  },
  ['sky'],
  { revalidate: 60 * 60 * 12 } // 12 hours
);

// Geocoding using US Census with fallback
async function geocodeLocation(location: string): Promise<{ coordinates: Coordinates; location: string }> {
  // First try the onelineaddress endpoint
  let url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(location)}&benchmark=Public_AR_Current&format=json`;
  
  let response = await fetch(url);
  if (!response.ok) {
    throw new Error('Geocoding failed');
  }
  
  let data = await response.json();
  console.log('[Geocoding] First attempt response:', JSON.stringify(data, null, 2));
  
  // If no matches and location looks like a ZIP code, try a different approach
  if (!data.result?.addressMatches?.length && /^\d{5}(-\d{4})?$/.test(location.trim())) {
    console.log('[Geocoding] Trying ZIP code specific search...');
    // Try searching for the ZIP code with "USA" appended
    url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(location + ', USA')}&benchmark=Public_AR_Current&format=json`;
    
    response = await fetch(url);
    if (response.ok) {
      data = await response.json();
      console.log('[Geocoding] ZIP code attempt response:', JSON.stringify(data, null, 2));
    }
  }
  
  // If still no matches, try the address search endpoint
  if (!data.result?.addressMatches?.length) {
    console.log('[Geocoding] Trying address search endpoint...');
    url = `https://geocoding.geo.census.gov/geocoder/locations/address?street=&city=&state=&zip=${encodeURIComponent(location)}&benchmark=Public_AR_Current&format=json`;
    
    response = await fetch(url);
    if (response.ok) {
      data = await response.json();
      console.log('[Geocoding] Address endpoint response:', JSON.stringify(data, null, 2));
    }
  }
  
  // Check if we have any address matches
  if (!data.result?.addressMatches?.length) {
    // As a last resort, try a simple OpenStreetMap Nominatim search (free, no key needed)
    console.log('[Geocoding] Trying OpenStreetMap fallback...');
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&limit=1&q=${encodeURIComponent(location)}`;
    
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Moongazers-App/1.0'
      }
    });
    
    if (nominatimResponse.ok) {
      const nominatimData = await nominatimResponse.json();
      console.log('[Geocoding] Nominatim response:', nominatimData);
      
      if (nominatimData.length > 0) {
        const place = nominatimData[0];
        return {
          coordinates: {
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon)
          },
          location: place.display_name
        };
      }
    }
    
    throw new Error(`Location not found: ${location}. Please try a more specific address.`);
  }
  
  const match = data.result.addressMatches[0];
  console.log('[Geocoding] Using match:', match);
  
  return {
    coordinates: {
      lat: parseFloat(match.coordinates.y),
      lng: parseFloat(match.coordinates.x)
    },
    location: match.matchedAddress
  };
}

// Get timezone using TimeZoneDB
async function getTimezone(lat: number, lng: number): Promise<string> {
  const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_KEY}&format=json&lat=${lat}&lng=${lng}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    // Fallback to America/Chicago for US locations
    return 'America/Chicago';
  }
  
  const data = await response.json();
  return data.zoneName || 'America/Chicago';
}

// Astrospheric API calls
async function getAstrosphericForecast(lat: number, lng: number) {
  const url = `https://api.astrospheric.com/GetForecastData_V1?key=${ASTROSPHERIC_KEY}&lat=${lat}&lon=${lng}&hours=72`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Astrospheric API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function getAstrosphericSkyData(lat: number, lng: number, dateTime: string, timezone: string) {
  const url = `https://api.astrospheric.com/GetSky_V1?key=${ASTROSPHERIC_KEY}&lat=${lat}&lon=${lng}&date=${dateTime}&tz=${timezone}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Astrospheric Sky API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Open-Meteo fallback
async function getOpenMeteoForecast(lat: number, lng: number): Promise<OpenMeteoForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=cloudcover,temperature_2m,wind_speed_10m&daily=sunrise,sunset&timezone=auto&forecast_days=4`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }
  
  return await response.json();
}

// Fallback sky data using simplified calculations
async function getFallbackSkyData(lat: number, lng: number, dateTime: string) {
  const date = new Date(dateTime);
  
  // Get moon data using astronomy engine
  const moonPhase = astronomy.MoonPhase(date);
  const moonIllumination = Math.round(100 * (1 - Math.abs(0.5 - moonPhase) * 2));
  
  // Simplified planet visibility (this would need more complex calculations)
  const planets: string[] = ['Jupiter', 'Saturn']; // Placeholder
  
  // Get bright stars
  const brightStars = await getBrightStars();
  const visibleStars: string[] = brightStars
    .filter(star => star.mag <= 2.0)
    .slice(0, 5) // Simplified - take first 5 bright stars
    .map(star => star.name);
  
  return {
    moon: {
      phase: getMoonPhaseName(moonPhase),
      illumination: moonIllumination,
      altitude: 45 // Placeholder
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
    const { location } = await request.json();
    
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }
    
    console.log(`[API] Processing request for location: ${location}`);
    
    // Step 1: Geocode location
    const { coordinates, location: formattedLocation } = await getCachedGeocode(location);
    const { lat, lng } = coordinates;
    
    console.log(`[API] Coordinates: ${lat}, ${lng}`);
    
    // Step 2: Get timezone
    const timezone = await getTimezone(lat, lng);
    console.log(`[API] Timezone: ${timezone}`);
    
    let provider = 'astrospheric';
    let forecastData: OpenMeteoForecast | unknown;
    
    // Step 3: Try Astrospheric first
    try {
      console.log('[API] Attempting Astrospheric forecast...');
      forecastData = await getCachedForecast(lat, lng, 'astrospheric');
      console.log('[API] Astrospheric forecast successful');
    } catch {
      console.log('[API] Astrospheric failed, falling back to Open-Meteo');
      provider = 'open-meteo';
      forecastData = await getCachedForecast(lat, lng, 'open-meteo');
    }
    
    // Step 4: Process forecast data and score time slots
    const timeSlots: TimeSlot[] = [];
    
    // Type guard for forecast data structure
    const hasHourlyData = (data: unknown): data is { hourly: { time: string[], cloudcover: number[], temperature_2m: number[], wind_speed_10m: number[] } } => {
      return typeof data === 'object' && data !== null && 'hourly' in data;
    };
    
    const hasNestedData = (data: unknown): data is { data: { hourly: { time: string[], cloudcover: number[], temperature_2m: number[], wind_speed_10m: number[] } } } => {
      return typeof data === 'object' && data !== null && 'data' in data && 
             typeof (data as any).data === 'object' && (data as any).data !== null && 'hourly' in (data as any).data;
    };
    
    let hourlyData: { time: string[], cloudcover: number[], temperature_2m: number[], wind_speed_10m: number[] };
    
    if (hasHourlyData(forecastData)) {
      hourlyData = forecastData.hourly;
    } else if (hasNestedData(forecastData)) {
      hourlyData = forecastData.data.hourly;
    } else {
      throw new Error('Invalid forecast data structure');
    }
    
    for (let i = 0; i < hourlyData.time.length; i++) {
      const time = new Date(hourlyData.time[i]);
      const cloudCover = hourlyData.cloudcover[i] || 0;
      const temperature = hourlyData.temperature_2m[i] || 70;
      const windSpeed = hourlyData.wind_speed_10m[i] || 5;
      
      // Determine if it's night time (simplified - using hour)
      const hour = time.getHours();
      const isNight = hour >= 21 || hour <= 6;
      
      if (isNight) {
        const score = scoreTimeSlot(cloudCover, 0, false); // Simplified for now
        
        timeSlots.push({
          time,
          cloudCover,
          temperature,
          windSpeed,
          score,
          isNight
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
      
      let skyData: unknown;
      try {
        skyData = await getCachedSkyData(lat, lng, dateTimeStr, timezone, provider);
      } catch {
        console.log('[API] Sky data failed, using fallback');
        skyData = await getCachedSkyData(lat, lng, dateTimeStr, timezone, 'fallback');
      }
      
      // Calculate average weather for the window
      const avgCloudCover = Math.round(window.slots.reduce((sum, s) => sum + s.cloudCover, 0) / window.slots.length);
      const avgTemp = Math.round(window.slots.reduce((sum, s) => sum + s.temperature, 0) / window.slots.length);
      const avgWind = Math.round(window.slots.reduce((sum, s) => sum + s.windSpeed, 0) / window.slots.length);
      
      // Format moon data
      const moonData: MoonData = {
        phase: (skyData as any).moon?.phase || 'Unknown',
        illum: (skyData as any).moon?.illumination || 0,
        impact: getMoonImpact((skyData as any).moon?.illumination || 0, ((skyData as any).moon?.altitude || 0) > 0)
      };
      
      // Format time strings
      const startStr = DateTime.fromJSDate(window.startTime).toFormat('MMM d, h:mm a');
      const endStr = DateTime.fromJSDate(window.endTime).toFormat('h:mm a');
      
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
    
    const response: BestWindowsResponse = {
      location: formattedLocation,
      windows: timeWindows
    };
    
    console.log(`[API] Returning ${timeWindows.length} windows`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moongazing data' },
      { status: 500 }
    );
  }
}
