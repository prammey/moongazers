'use client';

import { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import CurrentWeather from '@/components/CurrentWeather';
import ToggleSwitch from '@/components/ToggleSwitch';
import InlineResults from '@/components/InlineResults';
import LandingPage from '@/components/LandingPage';
import AdminDashboard from '@/components/AdminDashboard';
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
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [isLaunchingApp, setIsLaunchingApp] = useState(false);
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
  
  // Handle admin access with keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAdminDashboard(true);
        setShowLandingPage(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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
  
  // Handle launching the main app from landing page
  const handleLaunchApp = () => {
    setIsLaunchingApp(true);
    // Wait for slow, visible slide-up animation to complete before hiding landing page
    setTimeout(() => {
      setShowLandingPage(false);
      setIsLaunchingApp(false);
    }, 2500); // Increased time for slow, visible slide-up animation
  };

  // Prevent body scroll when landing page is active, but allow it during animation
  useEffect(() => {
    if (showLandingPage && !isLaunchingApp) {
      document.body.style.overflow = 'hidden';
    } else {
      // Allow scroll when launching or when landing page is closed
      document.body.style.overflow = '';
      // Force a small reflow to ensure scrollbars appear immediately
      void document.body.offsetHeight;
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLandingPage, isLaunchingApp]);
  
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

  // Handle admin dashboard navigation
  const handleBackToMain = () => {
    setShowAdminDashboard(false);
    setShowLandingPage(true);
  };

  // Show admin dashboard if requested
  if (showAdminDashboard) {
    return <AdminDashboard onBackToMain={handleBackToMain} />;
  }

  return (
    <div style={{ backgroundColor: '#ffffff', position: 'relative' }}>
      {/* Main App - Always rendered but behind landing page when needed */}
      <div 
        className="relative"
        style={{ 
          backgroundColor: '#ffffff'
        }}
      >
        {/* Current Weather Display - Top Left */}
        <CurrentWeather weatherData={currentWeatherData || undefined} />

        {/* Rocket GIF - Top Right */}
        <div className="absolute top-2 right-4 sm:top-3 sm:right-6 lg:top-4 lg:right-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDocDialog(true)}
              className="text-xs sm:text-sm md:text-base bg-white border border-gray-300 px-3 py-1 rounded-md shadow-sm hover:shadow-md focus:outline-none transition-shadow kosugi-maru text-black text-bold cursor-pointer"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
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
        </div>

        {/* Landing Page Overlay - slides up to reveal main app */}
        {showLandingPage && (
          <div className="fixed inset-0 z-50">
            <LandingPage onLaunch={handleLaunchApp} isLaunching={isLaunchingApp} />
          </div>
        )}

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

            {/* Scrollable Content with custom scrollbar */}
            <div className="p-6 overflow-auto max-h-[75vh] custom-scrollbar" 
                 style={{ 
                   scrollbarWidth: 'thin',
                   scrollbarColor: '#4B5563 #F3F4F6',
                 }}>
              <h2 className="text-2xl font-bold mb-6 text-black border-b pb-3">MoonGazers Documentation</h2>
              
              <div className="prose prose-slate max-w-none">
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-black">What is MoonGazers?</h3>
                  <p className="text-black mb-4 leading-relaxed">
                    MoonGazers is an astronomical forecasting application that helps you find the best times for stargazing in your area over the next 72 hours. It analyzes weather patterns, cloud cover, moon phases, and celestial positions to recommend optimal viewing windows.
                  </p>
                  <p className="text-black mb-4 leading-relaxed">
                    Unlike standard weather apps that only tell you if it will rain, MoonGazers evaluates all the factors that matter for astronomy: cloud coverage, moon brightness and position, temperature, wind conditions, and visibility of celestial objects.
                  </p>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-black">How to Use</h3>
                  <ol className="list-decimal pl-5 text-black space-y-3">
                    <li>Enter a valid ZIP code (US) or location name in the input field (e.g., &ldquo;10001&rdquo; for New York, &ldquo;Chicago, IL&rdquo;, or &ldquo;London, UK&rdquo;)</li>
                    <li>Click the submit button (arrow) or press Enter to submit your location</li>
                    <li>View the recommended stargazing windows, sorted from best to acceptable conditions</li>
                    <li>Each window shows a time range when conditions are expected to be favorable</li>
                    <li>Toggle between Fahrenheit/Celsius using the temperature toggle switch</li>
                    <li>Toggle between 12-hour and 24-hour time formats using the time format toggle switch</li>
                  </ol>
                  
                  <div className="bg-gray-100 border-l-4 border-gray-400 p-4 my-4">
                    <h4 className="text-black font-semibold mb-2">Pro Tips:</h4>
                    <ul className="list-disc pl-5 text-black space-y-2">
                      <li>The app works best with specific location inputs</li>
                      <li>If no results appear, try a nearby location or check back later</li>
                      <li>For international locations, include the country name (e.g., &ldquo;Paris, France&rdquo;)</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-black">Understanding the Results</h3>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2 text-black">Weather Information</h4>
                  <ul className="list-disc pl-5 text-black space-y-2">
                    <li><strong>Temperature:</strong> Average temperature during the viewing window (shown in your preferred unit)</li>
                    <li><strong>Cloud Cover:</strong> Percentage of sky covered by clouds (lower is better for stargazing)</li>
                    <ul className="list-circle pl-5 text-black mt-1">
                      <li>No Cloud Coverage: 0-15% (Excellent visibility)</li>
                      <li>Low Cloud Coverage: 16-35% (Good visibility)</li>
                      <li>Medium Cloud Coverage: 36-60% (Fair visibility)</li>
                      <li>High Cloud Coverage: &gt;60% (Poor visibility)</li>
                    </ul>
                    <li><strong>Wind Speed:</strong> Average wind in km/h during the window (lower values provide more stable viewing)</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2 text-black">Moon Information</h4>
                  <ul className="list-disc pl-5 text-black space-y-2">
                    <li><strong>Moon Phase:</strong> Current lunar phase (New Moon, Waxing Crescent, First Quarter, etc.)</li>
                    <li><strong>Illumination:</strong> Percentage of the moon&apos;s visible disk that is illuminated (0% is new moon, 100% is full moon)</li>
                    <li><strong>Impact on Viewing:</strong> How the moon affects stargazing conditions</li>
                    <ul className="list-circle pl-5 text-black mt-1">
                      <li>Low Impact: Moon is dim or below horizon (ideal for deep-sky objects)</li>
                      <li>Medium Impact: Moderate moonlight (still good for brighter objects)</li>
                      <li>High Impact: Bright moonlight may wash out fainter objects</li>
                    </ul>
                  </ul>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2 text-black">Celestial Objects</h4>
                  <ul className="list-disc pl-5 text-black space-y-2">
                    <li><strong>Planets:</strong> Lists planets visible during the viewing window</li>
                    <li><strong>Bright Stars:</strong> Notable stars and star clusters visible during the time window</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-black">How It Works</h3>
                  <p className="text-black mb-3 leading-relaxed">
                    MoonGazers combines data from multiple sources and applies a sophisticated algorithm to identify the best stargazing opportunities:
                  </p>
                  
                  <ol className="list-decimal pl-5 text-black space-y-3">
                    <li><strong>Location Processing:</strong> Your location is geocoded to precise coordinates using either the US Census Geocoder (for US ZIP codes) or OpenStreetMap&apos;s Nominatim service (for international locations).</li>
                    <li><strong>Weather Analysis:</strong> Using Astrospheric&apos;s specialized astronomy weather data (with Open-Meteo as a fallback), the app retrieves hourly forecasts for cloud cover, temperature, and wind speed.</li>
                    <li><strong>Astronomy Calculations:</strong> The Astronomy Engine library calculates precise moon phases, illumination percentages, and the positions of planets and bright stars for your location.</li>
                    <li><strong>Scoring Algorithm:</strong> Each hourly slot gets scored based primarily on cloud cover, with additional factors for moon interference and celestial visibility.</li>
                    <li><strong>Window Grouping:</strong> Adjacent &ldquo;good&rdquo; time slots are grouped into viewing windows of at least 90 minutes, then ranked and filtered to show only the best opportunities.</li>
                  </ol>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 mt-4">
                    <h4 className="text-black font-semibold mb-2">Scoring Details:</h4>
                    <ul className="list-disc pl-5 text-black space-y-2">
                      <li>Base score = 1 - (cloudCover / 100)</li>
                      <li>Moon penalty: -0.2 if moon is visible and illumination ≥ 60%</li>
                      <li>Only slots with score ≥ 0.6 are considered &ldquo;good&rdquo;</li>
                      <li>Windows are sorted by average score (descending)</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-black">Data Sources & Disclaimers</h3>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2 text-black">Data Attribution</h4>
                  <p className="text-black mb-3 leading-relaxed">
                    Forecast data comes from Astrospheric and Open-Meteo; transformed for astronomy use. Star catalog data is derived from astronomical databases of bright stars visible to the naked eye under good viewing conditions.
                  </p>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2 text-black">Legal Disclaimers</h4>
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-4">
                    <ul className="list-disc pl-5 text-black space-y-3">
                      <li><strong>Accuracy:</strong> Results are provided &ldquo;as is&rdquo; and may be inaccurate or outdated. Weather predictions are inherently uncertain and actual conditions may vary significantly from forecasts.</li>
                      <li><strong>Purpose:</strong> This tool is for educational and informational purposes only and not for operational, commercial, professional, or critical decision-making.</li>
                      <li><strong>Liability:</strong> The creators and operators of MoonGazers assume no responsibility or liability for any errors or omissions in the content provided. The information contained is provided without warranties of any kind.</li>
                      <li><strong>Affiliation:</strong> Not affiliated with or endorsed by Astrospheric, Open-Meteo, US Census Bureau, OpenStreetMap, or any other data providers mentioned.</li>
                      <li><strong>Local Conditions:</strong> Light pollution, local weather patterns, horizon obstructions, and other factors not accounted for in our models may significantly impact actual viewing conditions.</li>
                      <li><strong>Usage:</strong> By using this application, you acknowledge that you do so at your own discretion and risk.</li>
                    </ul>
                  </div>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2 text-black">Privacy Information</h4>
                  <p className="text-black mb-3 leading-relaxed">
                    Location data entered is used solely for providing forecasts and is not stored permanently. We use minimal cookies necessary for app functionality. No personal information is collected or shared with third parties.
                  </p>
                  
                  <p className="text-black mt-4 leading-relaxed">
                    Built with Next.js 15, React, TypeScript, and Tailwind CSS. For questions or concerns about this application, please use the Contact information provided.
                  </p>
                </section>
              </div>
            </div>
            
            {/* Add custom scrollbar styles */}
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #F3F4F6;
                border-radius: 4px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #4B5563;
                border-radius: 4px;
                border: 2px solid #F3F4F6;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: #374151;
              }
              
              .list-circle {
                list-style-type: circle;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}