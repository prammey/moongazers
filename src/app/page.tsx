'use client';

import { useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import CurrentWeather from '@/components/CurrentWeather';
import ToggleSwitch from '@/components/ToggleSwitch';
import InlineResults from '@/components/InlineResults';
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

  return (
    <div 
      className="relative min-h-screen"
      style={{ 
        backgroundColor: '#ffffff'
      }}
    >
      {/* Current Weather Display - Top Left */}
      <CurrentWeather weatherData={currentWeatherData || undefined} />

      {/* Rocket GIF - Top Right */}
      <div className="absolute top-2 right-4 sm:top-3 sm:right-6 lg:top-4 lg:right-8">
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
            Need help stargazing? Just enter your zip code below, and we will tell you the best times to go observe the sky and what you can see in the next 7 days.
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
            <div className="flex flex-row lg:flex-col gap-4 lg:gap-6 lg:mr-auto lg:ml-24">
              <ToggleSwitch
                leftLabel="Celsius"
                rightLabel="Fahrenheit"
                isRightSelected={temperatureUnit === 'fahrenheit'}
                onToggle={toggleTemperatureUnit}
              />
              <ToggleSwitch
                leftLabel="12-hr⠀"
                rightLabel="24-hr"
                isRightSelected={timeFormat === '24hr'}
                onToggle={toggleTimeFormat}
              />
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12" style={{ color: '#000000', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12" style={{ color: '#000000', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
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
    </div>
  );
}