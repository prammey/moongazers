'use client';

import { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import CurrentWeather from '@/components/CurrentWeather';
import ToggleSwitch from '@/components/ToggleSwitch';
import InlineResults from '@/components/InlineResults';
import LandingPage from '@/components/LandingPage';
import Image from 'next/image';

interface StargazingData {
  location: string;
  windows: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  currentWeather?: {
    temperature: number;
    cloudCover: number;
    skyQuality: string;
  } | null;
}

export default function Home() {
  const { temperatureUnit, timeFormat, toggleTemperatureUnit, toggleTimeFormat } = useWeather();
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stargazingData, setStargazingData] = useState<StargazingData | null>(null);
  const [currentWeatherData, setCurrentWeatherData] = useState<{
    location: string;
    temperature: number;
    skyQuality: string;
  } | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  
  // Handle Escape key for Doc modal
  useEffect(() => {
    if (!showDocDialog) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDocDialog(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDocDialog]);
  
  
  // Removed country selection functionality for simpler input

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/best-windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: location.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      setStargazingData(data);
      
      // Set current weather data if available
      if (data.currentWeather) {
        setCurrentWeatherData({
          location: data.location,
          temperature: data.currentWeather.temperature,
          skyQuality: data.currentWeather.skyQuality
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Check if the error is related to ZIP code validation
      if (errorMessage.toLowerCase().includes('location not found') || 
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('zip') ||
          errorMessage.toLowerCase().includes('postal')) {
        setError('Please check the provided ZIP code. Make sure it\'s a valid US ZIP code (e.g., 10001 or 90210).');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = () => {
    setShowLandingPage(false);
  };

  return (
    <div 
      className="relative min-h-screen"
      style={{ 
        backgroundColor: '#ffffff'
      }}
    >
      {/* Show landing page as overlay when active */}
      {showLandingPage && (
        <div className="fixed inset-0 z-50">
          <LandingPage onLaunch={handleLaunch} />
        </div>
      )}

      {/* Main App Content - Always rendered underneath */}
      {/* Current Weather Display - Top Left */}
      <CurrentWeather weatherData={currentWeatherData || undefined} />

      {/* Rocket GIF - Top Right */}
      <div className="absolute top-2 right-4 sm:top-3 sm:right-6 lg:top-4 lg:right-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowDocDialog(true)}
          className="text-xs sm:text-sm md:text-base bg-white border border-gray-300 px-3 py-1 rounded-md shadow-sm hover:shadow-md focus:outline-none transition-shadow kosugi-maru text-black text-bold cursor-pointer"
          style={{ fontFamily: "'Kosugi Maru', sans-serif" }}
        >
          Doc
        </button>
        <Image
          src="/rocket.gif"
          alt="Rocket"
          width={80}
          height={80}
          className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20"
        />
      </div>

      {/* Controls - Top Right - REMOVED */}

      {/* Main Content */}
      <div className="flex flex-col min-h-screen pt-2 sm:pt-3 md:pt-4 px-4 sm:px-6 lg:px-8">
        {/* Top Section with Moon aligned to weather info */}
        <div className="w-full mb-16 sm:mb-20 md:mb-24">
          {/* Moon Image - positioned higher and fixed size */}
          <div className="flex justify-center">
            <div className="relative group">
              <Image
              src="/moon.png"
              alt="Moon"
              width={128}
              height={128}
              className="w-32 h-32 object-contain cursor-pointer hover:scale-105 transition-transform"
              />
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-white border border-gray-300 text-gray-800 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
              clicked by me :)
              {/* Arrow */}
              <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-16 sm:mb-20 md:mb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 sm:mb-10 md:mb-12" style={{ 
            color: '#000000',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)'
          }}>
            Welcome, Moongazer!
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-xs sm:max-w-sm md:max-w-lg mx-auto mt-8 sm:mt-10 md:mt-12 text-gray-700">
            Need help stargazing? Just enter your zip code below, and we will tell you the best times to go observe the sky and what you can see in the next 3 days.
          </p>
        </div>

        {/* Search Form with Side Toggles */}
        <div className="w-full max-w-8xl mb-16 sm:mb-20 md:mb-24">
          <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-8 sm:gap-12 lg:gap-48">
            {/* Main Input Form - centered */}
            <div className="w-full max-w-60 sm:max-w-72 lg:max-w-80 lg:ml-auto">
              <form onSubmit={handleSubmit}>
                <div className="flex items-center bg-white rounded-lg border-2" style={{
                  borderColor: '#000000',
                  boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.12)'
                }}>
                  {/* ZIP Code Input */}
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your US ZIP code..."
                    className="flex-1 p-3 text-sm sm:text-base bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none min-w-0 rounded-l-lg"
                    disabled={loading}
                  />

                  {/* Submit Button with Enhanced Enter Symbol */}
                  <button
                    type="submit"
                    disabled={loading || !location.trim()}
                    className={`p-3 transition-all ${
                      loading || !location.trim()
                        ? 'cursor-not-allowed text-gray-400'
                        : 'hover:opacity-70 hover:scale-110'
                    } focus:outline-none`}
                    style={{
                      color: loading || !location.trim() ? '#9ca3af' : '#27a4da'
                    }}
                  >
                    {loading ? (
                      <span className="text-xl animate-spin" style={{ animationDuration: '2s' }}>⏳</span>
                    ) : (
                      <span className="text-xl font-bold" style={{ 
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        transform: 'rotate(-90deg)',
                        display: 'inline-block'
                      }}>⮐</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Side Toggles - pushed far to the right */}
            <div className="flex flex-col gap-4 lg:mr-auto lg:ml-24">
              <ToggleSwitch
                leftLabel="Celsius"
                rightLabel="Fahrenheit"
                isRightSelected={temperatureUnit === 'fahrenheit'}
                onToggle={toggleTemperatureUnit}
              />
              <div className="w-full">
                <ToggleSwitch
                  leftLabel="12-hr"
                  rightLabel="24-hr"
                  isRightSelected={timeFormat === '24hr'}
                  onToggle={toggleTimeFormat}
                  className="[&>span:first-child]:w-12 [&>span:first-child]:text-left"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-6 rounded-xl bg-white/90 border border-gray-200 text-gray-700 max-w-lg mx-auto text-center shadow-lg backdrop-blur-sm" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              <div className="text-2xl mb-3 text-amber-500">⚠</div>
              <p className="text-sm leading-relaxed">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Results Section - Always show heading when we have data, error, or loading */}
        {(stargazingData || error || loading) && (
          <div className="w-full mb-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl text-center mb-8 sm:mb-10 md:mb-12" style={{ color: '#000000', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
              Here are the best days to go out and stargaze...
            </h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-600">
                [ fetching... ]
              </div>
            ) : (
              <InlineResults 
                data={stargazingData} 
                loading={loading} 
                error={error} 
              />
            )}
          </div>
        )}

        {/* Default State - Only show when no data, no error, and not loading */}
        {(!stargazingData && !error && !loading) && (
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl text-center mb-8 sm:mb-10 md:mb-12" style={{ color: '#000000', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
              Here are the best days to go out and stargaze...
            </h2>
            <div className="text-center py-12 text-gray-600">
              [ waiting for zip code... ]
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="w-full mt-16 py-8 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600 text-sm mb-6">
              Hi! I&apos;m Prameet. Thank you for visiting my website. Other links:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button
                onClick={() => setShowContactDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-800 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Image src="/letter.png" alt="Contact" width={16} height={16} />
                <span>Contact</span>
              </button>
              
              <a
                href="https://prameet.space"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-800 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <h1>🌍</h1>
                <span>My Portfolio</span>
              </a>
              
              <a
                href="https://buymeacoffee.com/prameet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-800 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Image src="/coffee.png" alt="Buy me a coffee" width={16} height={16} />
                <span>Buy me a coffee</span>
              </a>
            </div>
            
            <p className="text-gray-600 text-sm">
              Say hello: <a href="mailto:prameet.guha@gmail.com" className="text-blue-600 hover:underline">prameet.guha@gmail.com</a>
            </p>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-xs leading-relaxed mb-2">
                <strong>Disclaimer:</strong> Data provided by Astrospheric API and Open-Meteo. 
                Moon illumination values are approximate; conditions may vary depending on local light pollution. 
                Built with Next.js, Tailwind CSS, NeonDB, and Vercel Cron.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Note: Conditions may vary depending on local weather and light pollution.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Contact Dialog */}
      {showContactDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal */}
          <div 
            className="bg-white rounded-lg border-2 border-gray-800 w-full max-w-sm relative"
            style={{
              boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-800 px-3 py-2 rounded-t-lg flex justify-between items-center">
              <h2 className="text-base font-bold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>Contact</h2>
              <button
                onClick={() => setShowContactDialog(false)}
                className="w-8 h-8 bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors text-lg font-bold"
                style={{ borderRadius: '0' }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              <div>
                <p className="text-black font-semibold mb-1">Email:</p>
                <a 
                  href="mailto:prameet.guha@gmail.com" 
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  prameet.guha@gmail.com
                </a>
              </div>

              <div>
                <p className="text-black font-semibold mb-1">Text:</p>
                <p className="text-black">+1 (331) 269-7958</p>
              </div>

              {/* OK Button */}
              <div className="flex justify-center pt-3">
                <button
                  onClick={() => setShowContactDialog(false)}
                  className="bg-blue-500 text-white px-6 py-1.5 rounded border-2 border-gray-800 hover:bg-blue-600 transition-colors font-semibold text-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doc Modal */}
      {showDocDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowDocDialog(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100" style={{ boxShadow: '0 6px 8px -6px rgba(0,0,0,0.25)' }}>
              <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
              <button
                type="button"
                onClick={() => setShowDocDialog(false)}
                aria-label="Close documentation"
                className="w-9 h-9 flex items-center justify-center bg-red-600 text-white font-bold transition-shadow hover:bg-red-700 cursor-pointer"
                style={{ borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
              >
                <span style={{ lineHeight: 0 }}>✕</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-auto max-h-[75vh] prose prose-sm max-w-none doc-scroll">
              <h2 className="text-xl font-bold mb-4 text-gray-900">How the app chooses the best nights to stargaze</h2>
              
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Overview</h3>
              <p className="mb-4 text-gray-700">
                This document explains the server-side API used by the Moongazers app, what data is fetched from external providers, 
                how it&apos;s processed, cached, and where the results are used in the frontend.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Primary API endpoint</h3>
              <ul className="mb-4 text-gray-700">
                <li><strong>POST /api/best-windows</strong></li>
                <li><strong>Purpose:</strong> Accepts a location string (US ZIP or global place), geocodes it to coordinates, fetches weather and sky data, scores candidate night-time windows for stargazing, and returns the best windows and current weather summary.</li>
                <li><strong>Input:</strong> JSON {`{ location: string }`}</li>
                <li><strong>Output:</strong> JSON with location, coordinates, currentWeather, and windows array</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">How It Works - Step by Step</h3>
              <ol className="mb-4 text-gray-700 space-y-2">
                <li><strong>1. Geocoding:</strong> Your ZIP code or location is converted to latitude/longitude coordinates using US Census (for US ZIP codes) or OpenStreetMap Nominatim (for international locations).</li>
                <li><strong>2. Weather Data:</strong> Hourly weather data is fetched from Astrospheric (primary) or Open-Meteo (fallback), including cloud cover, temperature, and wind speed.</li>
                <li><strong>3. Astronomical Calculations:</strong> Moon phase, illumination percentage, and visibility are calculated using the Astronomy Engine.</li>
                <li><strong>4. Time Window Scoring:</strong> Each 3-hour nighttime window gets a visibility score based on cloud cover and moon interference.</li>
                <li><strong>5. Ranking & Selection:</strong> Windows are ranked by score and the top results are returned with detailed information.</li>
              </ol>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Scoring Logic</h3>
              <p className="mb-2 text-gray-700">Each time window gets a visibility score calculated as:</p>
              <ul className="mb-4 text-gray-700">
                <li><strong>Base Score:</strong> 1 - (cloudCover / 100) — lower cloud cover = higher score</li>
                <li><strong>Moon Penalty:</strong> If moon is visible and ≥60% illuminated, score is reduced by 0.2</li>
                <li><strong>Threshold:</strong> Only windows with score ≥0.6 are considered &quot;good&quot; for stargazing</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Weather Data Sources</h3>
              <ul className="mb-4 text-gray-700">
                <li><strong>Primary:</strong> Astrospheric API (astronomy-focused weather data)</li>
                <li><strong>Fallback:</strong> Open-Meteo (free weather service)</li>
                <li><strong>Data Used:</strong> Hourly cloud cover, temperature, wind speed, plus sunrise/sunset times</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Caching Strategy</h3>
              <p className="mb-4 text-gray-700">
                To improve performance and reduce external API calls, data is cached with different durations:
                geocoding (long-term), weather forecasts (6 hours), and sky data (12 hours).
              </p>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Cloud Coverage Labels</h3>
              <p className="mb-2 text-gray-700">Cloud cover percentages are converted to user-friendly labels:</p>
              <ul className="mb-4 text-gray-700">
                <li><strong>0-10%:</strong> No Cloud Coverage</li>
                <li><strong>11-30%:</strong> Low Cloud Coverage</li>
                <li><strong>31-60%:</strong> Medium Cloud Coverage</li>
                <li><strong>61-100%:</strong> High Cloud Coverage</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">What You See in Results</h3>
              <p className="mb-2 text-gray-700">Each recommended time window includes:</p>
              <ul className="mb-4 text-gray-700">
                <li><strong>Time Range:</strong> Start and end times for optimal viewing</li>
                <li><strong>Weather:</strong> Cloud coverage, temperature, and wind conditions</li>
                <li><strong>Moon Info:</strong> Phase, illumination percentage, and impact on visibility</li>
                <li><strong>Visible Objects:</strong> Lists of planets and bright stars you can expect to see</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Error Handling</h3>
              <p className="mb-4 text-gray-700">
                The system includes multiple fallback mechanisms: if the primary weather service fails, it switches to the backup service. 
                If US geocoding fails, it tries international geocoding. All errors are converted to user-friendly messages.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Technical Notes</h3>
              <ul className="mb-4 text-gray-700">
                <li>Built with Next.js 15 App Router and TypeScript</li>
                <li>Uses server-side caching with revalidation</li>
                <li>Moon illumination values are clamped to 0-100% range</li>
                <li>Responsive design works on mobile and desktop</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}