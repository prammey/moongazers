import { NextRequest, NextResponse } from 'next/server';

// Current temperature where the visitor is, from the approximate location
// Vercel attaches to every request (city level, from the IP address), so the
// header shows local weather without asking for location permission.
export async function GET(request: NextRequest) {
  const lat = Number(request.headers.get('x-vercel-ip-latitude'));
  const lon = Number(request.headers.get('x-vercel-ip-longitude'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) {
    return NextResponse.json({ temperature: null });
  }

  // Rounded to ~10 km so nearby visitors share one cached forecast
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(1)}&longitude=${lon.toFixed(1)}&current=temperature_2m`;
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return NextResponse.json({ temperature: null });
    const data = await res.json();
    const temperature = data?.current?.temperature_2m;
    return NextResponse.json({ temperature: typeof temperature === 'number' ? temperature : null });
  } catch {
    return NextResponse.json({ temperature: null });
  }
}
