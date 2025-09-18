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
              <h2 className="text-xl font-bold mb-4 text-gray-900">Moongazers: Complete Stargazing Guide & Documentation</h2>
              
              <h3 className="text-lg font-semibold mb-3 text-gray-800">What is Moongazers?</h3>
              <p className="mb-4 text-gray-700">
                Moongazers is an intelligent stargazing forecast application that analyzes weather patterns, astronomical events, and sky conditions to recommend the optimal times for celestial observations. Whether you&apos;re a casual stargazer or an experienced astronomer, this app provides data-driven recommendations for your next stargazing session.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">How It Works</h3>
              <p className="mb-2 text-gray-700">Our sophisticated algorithm processes multiple data sources:</p>
              <ol className="mb-4 text-gray-700 space-y-2">
                <li><strong>1. Location Processing:</strong> Your ZIP code is geocoded to precise latitude/longitude coordinates using US Census Bureau data (for US locations) or OpenStreetMap Nominatim service (international).</li>
                <li><strong>2. Weather Analysis:</strong> Hourly meteorological data is fetched from professional weather services, including cloud cover percentage, temperature, wind speed, and atmospheric pressure.</li>
                <li><strong>3. Astronomical Calculations:</strong> Real-time celestial mechanics are computed using the Astronomy Engine library, calculating moon phases, planetary positions, and stellar visibility.</li>
                <li><strong>4. Sky Quality Assessment:</strong> Each time window receives a visibility score based on cloud cover, moon interference, and atmospheric conditions.</li>
                <li><strong>5. Intelligent Filtering:</strong> Only time windows before 4:30 AM are considered, as this represents optimal astronomical observation periods when the sky is darkest.</li>
                <li><strong>6. Ranking & Recommendations:</strong> The top 3 time windows are selected and presented with comprehensive observational data.</li>
              </ol>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Understanding Your Results</h3>
              
              <h4 className="text-base font-semibold mb-2 text-gray-800">Cloud Coverage Classifications</h4>
              <ul className="mb-4 text-gray-700">
                <li><strong>No Cloud Coverage (0-10%):</strong> Exceptional conditions - perfect for deep-sky photography and faint object observation</li>
                <li><strong>Low Cloud Coverage (11-30%):</strong> Excellent conditions - ideal for planetary observation and bright deep-sky objects</li>
                <li><strong>Medium Cloud Coverage (31-60%):</strong> Fair conditions - suitable for moon, planets, and bright stars</li>
                <li><strong>High Cloud Coverage (61-100%):</strong> Poor conditions - limited to brightest objects only</li>
              </ul>

              <h4 className="text-base font-semibold mb-2 text-gray-800">Moon Impact Assessment</h4>
              <ul className="mb-4 text-gray-700">
                <li><strong>Low Impact:</strong> New moon or thin crescent (&lt;30% illumination) - optimal for deep-sky observations and astrophotography</li>
                <li><strong>Medium Impact:</strong> Quarter moon phases (30-70% illumination) - good for planetary and lunar observation</li>
                <li><strong>High Impact:</strong> Full or gibbous moon (&gt;70% illumination) - bright sky limits faint object visibility but excellent for lunar features</li>
              </ul>

              <h4 className="text-base font-semibold mb-2 text-gray-800">Visible Celestial Objects</h4>
              <p className="mb-2 text-gray-700">Objects are determined by:</p>
              <ul className="mb-4 text-gray-700">
                <li><strong>Planets:</strong> Calculated positions above horizon with magnitude &gt; 0 (naked-eye visibility)</li>
                <li><strong>Stars:</strong> Selected from Hipparcos catalog with magnitude &lt; 2.5, filtered by altitude &gt; 30° for optimal viewing</li>
                <li><strong>Viewing Recommendations:</strong> Objects listed are visible to naked eye under stated conditions</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Technical Specifications</h3>
              
              <h4 className="text-base font-semibold mb-2 text-gray-800">Data Sources & APIs</h4>
              <ul className="mb-4 text-gray-700">
                <li><strong>Primary Weather:</strong> Astrospheric API - specialized astronomical weather forecasting with seeing conditions</li>
                <li><strong>Backup Weather:</strong> Open-Meteo - European weather model with high-resolution forecasts</li>
                <li><strong>Geocoding:</strong> US Census Bureau (domestic) / OpenStreetMap Nominatim (international)</li>
                <li><strong>Astronomical Calculations:</strong> Astronomy Engine - precise celestial mechanics library</li>
                <li><strong>Time Zones:</strong> TimeZoneDB API for accurate local time conversions</li>
              </ul>

              <h4 className="text-base font-semibold mb-2 text-gray-800">Scoring Algorithm</h4>
              <p className="mb-2 text-gray-700">Each observation window receives a visibility score:</p>
              <ul className="mb-4 text-gray-700">
                <li><strong>Base Score:</strong> 1.0 - (cloudCover / 100) — clear skies = higher score</li>
                <li><strong>Moon Penalty:</strong> -0.2 deduction if moon illumination ≥60% and above horizon</li>
                <li><strong>Minimum Threshold:</strong> Only windows scoring ≥0.6 are considered viable</li>
                <li><strong>Time Filtering:</strong> Windows ending after 4:30 AM are excluded (astronomical twilight consideration)</li>
              </ul>

              <h4 className="text-base font-semibold mb-2 text-gray-800">Caching & Performance</h4>
              <ul className="mb-4 text-gray-700">
                <li><strong>Geocoding Cache:</strong> 30 days (coordinates rarely change)</li>
                <li><strong>Weather Cache:</strong> 6 hours (balances accuracy with performance)</li>
                <li><strong>Astronomical Cache:</strong> 12 hours (celestial positions change slowly)</li>
                <li><strong>Error Handling:</strong> Automatic fallback between primary and backup services</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">For Different User Types</h3>
              
              <h4 className="text-base font-semibold mb-2 text-gray-800">Casual Stargazers</h4>
              <ul className="mb-4 text-gray-700">
                <li>Focus on <strong>Low/No Cloud Coverage</strong> recommendations</li>
                <li>Best results during <strong>Low Moon Impact</strong> periods</li>
                <li>Start with bright planets (Jupiter, Venus) and prominent stars listed</li>
                <li>Use temperature data to dress appropriately for outdoor viewing</li>
              </ul>

              <h4 className="text-base font-semibold mb-2 text-gray-800">Telescope Users</h4>
              <ul className="mb-4 text-gray-700">
                <li>Prioritize windows with <strong>wind speeds &lt;15 mph</strong> for stable viewing</li>
                <li>Moon phases affect different targets: new moon for galaxies/nebulae, full moon for lunar details</li>
                <li>Use planetary positions for high-magnification observations</li>
                <li>Consider atmospheric seeing conditions from weather data</li>
              </ul>

              <h4 className="text-base font-semibold mb-2 text-gray-800">Astrophotographers</h4>
              <ul className="mb-4 text-gray-700">
                <li>Seek <strong>No Cloud Coverage</strong> periods exclusively</li>
                <li>New moon phases (Low Impact) essential for deep-sky imaging</li>
                <li>Monitor wind conditions for equipment stability</li>
                <li>Plan multi-hour sessions within recommended windows</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Important Disclaimers</h3>
              <ul className="mb-4 text-gray-700">
                <li><strong>Weather Accuracy:</strong> Forecasts are predictions and may change. Always check current conditions before traveling.</li>
                <li><strong>Local Variations:</strong> Microclimates, elevation, and nearby weather systems can create conditions different from forecasts.</li>
                <li><strong>Light Pollution:</strong> Calculations assume dark sky conditions. Urban light pollution significantly reduces visible objects.</li>
                <li><strong>Atmospheric Seeing:</strong> Even clear skies may have poor atmospheric stability affecting telescopic observations.</li>
                <li><strong>Safety:</strong> Always inform others of stargazing plans and observe safety protocols for nighttime outdoor activities.</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Credits & Acknowledgments</h3>
              <div className="mb-4 text-gray-700">
                <p className="mb-2"><strong>Data Providers:</strong></p>
                <ul className="mb-3">
                  <li><strong>Astrospheric:</strong> Professional astronomical weather forecasting service</li>
                  <li><strong>Open-Meteo:</strong> Open-source European weather prediction models</li>
                  <li><strong>US Census Bureau:</strong> Accurate US geographic coordinate data</li>
                  <li><strong>OpenStreetMap:</strong> Global geographic database and geocoding services</li>
                  <li><strong>TimeZoneDB:</strong> Comprehensive timezone and daylight saving time database</li>
                </ul>
                
                <p className="mb-2"><strong>Scientific Libraries:</strong></p>
                <ul className="mb-3">
                  <li><strong>Astronomy Engine:</strong> Precise astronomical calculations by Don Cross</li>
                  <li><strong>Hipparcos Star Catalog:</strong> European Space Agency stellar position database</li>
                  <li><strong>Luxon:</strong> Sophisticated date/time handling for astronomical calculations</li>
                </ul>
                
                <p className="mb-2"><strong>Development:</strong></p>
                <ul className="mb-4">
                  <li>Built with <strong>Next.js 15</strong> and <strong>TypeScript</strong> for type-safe development</li>
                  <li>Styled with <strong>Tailwind CSS</strong> for responsive design</li>
                  <li>Hosted on <strong>Vercel</strong> with global CDN for fast worldwide access</li>
                  <li>Created by <strong>Prameet Guha</strong> with passion for astronomy and education</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">Support & Feedback</h3>
              <p className="mb-4 text-gray-700">
                Questions, suggestions, or found a bug? Contact us at <strong>prameet.guha@gmail.com</strong> or visit <strong>prameet.space</strong> for more projects. 
                We&apos;re committed to improving stargazing accessibility for everyone!
              </p>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>License:</strong> Educational and personal use | 
                  <strong>Accuracy:</strong> Weather forecasts typically 70-85% accurate 3+ days out, astronomical calculations precise to arc-seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}