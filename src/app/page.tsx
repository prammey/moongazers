'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeather } from '@/contexts/WeatherContext';
import CurrentWeather from '@/components/CurrentWeather';
import ToggleSwitch from '@/components/ToggleSwitch';
import InlineResults from '@/components/InlineResults';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkSoftBreaks from '@/lib/remarkSoftBreaks';

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
  const router = useRouter();
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
  const [documentation, setDocumentation] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [docError, setDocError] = useState(false);
  
  // Handle admin access with keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        router.push('/admin');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);
  
  // Escape closes the Doc and Contact dialogs
  useEffect(() => {
    if (!showDocDialog && !showContactDialog) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDocDialog(false);
        setShowContactDialog(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDocDialog, showContactDialog]);
  
  // Fetch documentation from API
  const fetchDocumentation = async () => {
    setDocError(false);
    try {
      const response = await fetch('/api/admin/documentation');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setDocumentation(await response.json());
    } catch (error) {
      // Without this the dialog said "Loading documentation..." forever
      console.error('Failed to fetch documentation:', error);
      setDocError(true);
    }
  };

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

      // The API explains what went wrong (unknown place, weather service down)
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

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
      // A failed fetch (offline) is a TypeError with a browser-specific message
      setError(
        err instanceof TypeError
          ? "Couldn't reach MoonGazers. Check your connection and try again."
          : err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setStargazingData(null);
      setCurrentWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', position: 'relative' }}>
      {/* Main App */}
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
              onClick={() => {
                setShowDocDialog(true);
                fetchDocumentation();
              }}
              className="text-xs sm:text-sm md:text-base bg-white border-2 border-black px-3 py-1 rounded-md shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all kosugi-maru text-black cursor-pointer"
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

          {/* Main Content */}
          <div className="flex flex-col min-h-screen pt-2 sm:pt-3 md:pt-4 px-4 sm:px-6 lg:px-8">
            {/* Top Section with Moon aligned to weather info */}
            <div className="w-full pt-16 sm:pt-0 mb-10 sm:mb-14 md:mb-16">
              {/* Moon Image - positioned higher and fixed size */}
              <div className="flex justify-center">
                <div className="relative group">
                  <Image
                  src="/moon.png"
                  alt="Moon"
                  width={128}
                  height={128}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain hover:scale-105 transition-transform"
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
            <div className="text-center mb-12 sm:mb-16">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
                <span
                  className="inline-block pb-2"
                  style={{
                    background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 55%, #9333ea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 6px 18px rgba(124, 58, 237, 0.28))',
                  }}
                >
                  Welcome, Moongazer!
                </span>
              </h1>
              <p className="text-base md:text-lg max-w-sm md:max-w-xl mx-auto mt-6 sm:mt-8 text-gray-600 leading-relaxed">
                Need help stargazing? Enter your ZIP or postal code below, and we&apos;ll tell you the best times to observe the sky, and what you can see, over the next 3 days.
              </p>
            </div>

            {/* Search Form with Side Toggles */}
            <div className="w-full mb-14 sm:mb-16 md:mb-20">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
                {/* Main Input Form - centered */}
                <div className="w-full max-w-72 sm:max-w-80">
                  <form onSubmit={handleSubmit}>
                    <div className="flex items-center bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_#000] focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 transition-shadow">
                      {/* ZIP Code Input */}
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        aria-label="ZIP code, postal code or city"
                        placeholder="ZIP, postal code or city..."
                        className="flex-1 p-3 text-sm sm:text-base bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none min-w-0"
                        disabled={loading}
                      />

                      {/* Submit Button with Enhanced Enter Symbol */}
                      <button
                        type="submit"
                        aria-label="Find stargazing times"
                        disabled={loading || !location.trim()}
                        className={`p-3 transition-all ${
                          loading || !location.trim()
                            ? 'cursor-not-allowed text-gray-400'
                            : 'hover:opacity-70 hover:scale-110'
                        } focus:outline-none`}
                        style={{
                          color: loading || !location.trim() ? '#9ca3af' : '#2563eb'
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
                <div className="flex flex-col gap-4">
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

            </div>

            {/* Results Section - Always show heading when we have data, error, or loading */}
            {(stargazingData || error || loading) && (
              <div className="w-full mb-12 sm:px-6 lg:px-8">
                {/* No "best days" promise above an error message */}
                {!error && (
                  <h2 className="text-xl sm:text-2xl md:text-3xl text-center mb-8 sm:mb-10 md:mb-12" style={{ color: '#111827' }}>
                    Here are the best days to go out and stargaze...
                  </h2>
                )}

                {loading ? (
                  <div className="text-center py-12 text-gray-600 animate-pulse" role="status">
                    [ fetching the sky... ]
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
                <h2 className="text-xl sm:text-2xl md:text-3xl text-center mb-8 sm:mb-10 md:mb-12" style={{ color: '#111827' }}>
                  Here are the best days to go out and stargaze...
                </h2>
                <div className="text-center py-10 text-gray-500">
                  [ waiting for zip code... ]
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="w-full mt-auto pt-16 pb-10 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-gray-600 text-sm mb-6">
                  Hi! I&apos;m Prameet. Thank you for visiting my website. Other links:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <button
                    onClick={() => setShowContactDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg bg-white text-gray-900 shadow-[3px_3px_0_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_#000] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all cursor-pointer"
                  >
                    <Image src="/letter.png" alt="Contact" width={16} height={16} />
                    <span>Contact</span>
                  </button>
                  
                  <a
                    href="https://prameet.space"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg bg-white text-gray-900 shadow-[3px_3px_0_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_#000] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
                  >
                    <span aria-hidden="true">🌍</span>
                    <span>My Portfolio</span>
                  </a>
                  
                  <a
                    href="https://buymeacoffee.com/prameet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg bg-white text-gray-900 shadow-[3px_3px_0_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_#000] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
                  >
                    <Image src="/coffee.png" alt="Buy me a coffee" width={16} height={16} />
                    <span>Buy me a coffee</span>
                  </a>
                </div>
                
                <p className="text-gray-600 text-sm">
                  Say hello: <a href="mailto:prameet.guha@gmail.com" className="text-blue-600 hover:underline">prameet.guha@gmail.com</a>
                </p>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-xs leading-relaxed">
                    <strong>Disclaimer:</strong> Weather data from Open-Meteo; locations from OpenStreetMap.
                    Moon, planet and star positions are calculated with Astronomy Engine and are approximate; conditions may vary depending on local light pollution.
                    Built with Next.js, Tailwind CSS and a Neon Postgres database.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>

      {/* Contact Dialog */}
      {showContactDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowContactDialog(false)}
          />
          {/* Modal */}
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            className="bg-white rounded-lg border-2 border-black w-full max-w-sm relative shadow-[6px_6px_0_0_#000]"
          >
            {/* Header */}
            <div className="bg-white border-b-2 border-black px-4 py-2 rounded-t-lg flex justify-between items-center">
              <h2 id="contact-title" className="text-base font-bold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>Contact</h2>
              <button
                onClick={() => setShowContactDialog(false)}
                aria-label="Close contact"
                autoFocus
                className="w-8 h-8 bg-red-600 text-white border-2 border-black rounded-md flex items-center justify-center hover:bg-red-700 transition-colors text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
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
                  className="bg-blue-600 text-white px-8 py-1.5 rounded-md border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-blue-700 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_#000] transition-all font-semibold text-sm cursor-pointer"
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
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowDocDialog(false)}
          />

          {/* Modal */}
          <div role="dialog" aria-modal="true" aria-labelledby="doc-title" className="relative bg-white rounded-lg border-2 border-black shadow-[6px_6px_0_0_#000] w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black">
              <h3 id="doc-title" className="text-lg font-semibold text-gray-900">Documentation</h3>
              <button
                type="button"
                autoFocus
                onClick={() => setShowDocDialog(false)}
                aria-label="Close documentation"
                className="w-9 h-9 flex items-center justify-center bg-red-600 text-white font-bold border-2 border-black rounded-md transition-colors hover:bg-red-700 cursor-pointer"
              >
                <span style={{ lineHeight: 0 }}>✕</span>
              </button>
            </div>

            {/* Scrollable Content with custom scrollbar */}
            <div className="p-5 sm:p-8 overflow-auto max-h-[calc(85vh-4rem)] custom-scrollbar" 
                 style={{ 
                   scrollbarWidth: 'thin',
                   scrollbarColor: '#4B5563 #F3F4F6',
                 }}>
              {documentation ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-black border-b-2 border-black pb-3">{documentation.title}</h2>
                  <div className="prose prose-slate max-w-none text-black">
                    <ReactMarkdown
                      remarkPlugins={[remarkSoftBreaks]}
                      components={{
                        h1: ({children}) => <h1 className="text-3xl font-bold mb-6 text-black">{children}</h1>,
                        h2: ({children}) => <h2 className="text-2xl font-bold mb-4 text-black">{children}</h2>,
                        h3: ({children}) => <h3 className="text-xl font-semibold mb-3 text-black">{children}</h3>,
                        h4: ({children}) => <h4 className="text-lg font-medium mb-2 text-black">{children}</h4>,
                        p: ({children}) => <p className="text-black mb-4 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-5 text-black space-y-2 mb-4">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-5 text-black space-y-3 mb-4">{children}</ol>,
                        li: ({children}) => <li className="text-black">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
                        blockquote: ({children}) => <div className="bg-gray-50 border-l-4 border-black px-4 pt-4 pb-0.5 my-4">{children}</div>,
                        code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm">{children}</code>,
                        pre: ({children}) => <pre className="bg-gray-50 border border-gray-200 rounded p-4 overflow-x-auto">{children}</pre>,
                      }}
                    >
                      {documentation.content}
                    </ReactMarkdown>
                  </div>
                </>
              ) : docError ? (
                <div className="text-center py-8">
                  <p className="text-black mb-4">Couldn&apos;t load the documentation.</p>
                  <button
                    type="button"
                    onClick={fetchDocumentation}
                    className="px-4 py-2 border-2 border-black rounded-md text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-black">Loading documentation...</p>
                </div>
              )}
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