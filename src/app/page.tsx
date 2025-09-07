'use client';

import { useState } from 'react';
import { BestWindowsResponse, TimeWindow } from '@/types';

export default function Home() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BestWindowsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/best-windows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: location.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch moongazing data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCloudBadge = (cloudPercent: number) => {
    if (cloudPercent <= 20) {
      return { text: 'Clear', color: 'bg-green-600 text-white' };
    } else if (cloudPercent <= 60) {
      return { text: 'Partly Cloudy', color: 'bg-yellow-600 text-white' };
    } else {
      return { text: 'Cloudy', color: 'bg-red-600 text-white' };
    }
  };

  const getMoonImpactTag = (impact: string) => {
    const colors = {
      Low: 'bg-green-100 text-green-800 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      High: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[impact as keyof typeof colors] || colors.Low;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff2cc' }}>
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        
        {/* Progress Bar */}
        {loading && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-700">Searching...</span>
              <span className="text-sm font-bold text-gray-600">Finding best times</span>
            </div>
            <div className="w-full bg-gray-300 h-3 shadow-lg">
              <div className="bg-gray-700 h-3 w-2/3 animate-pulse shadow-inner"></div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div style={{ backgroundColor: '#f8f6f0', boxShadow: '8px 8px 0px #000000', border: '4px solid #000000' }} className="p-8 mb-8">
          
          {!data && !error && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-gray-900 mb-4">
                  Moongazers
                </h1>
                <p className="text-xl text-gray-600 font-bold">
                  Find the best stargazing times in your area
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-black text-gray-900 mb-3">
                      Enter your location (US only)
                    </label>
                    <input
                      type="text"
                      placeholder="ZIP code or City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-6 py-4 border-4 border-gray-300 focus:ring-0 focus:border-gray-600 text-black placeholder:text-gray-500 font-bold text-lg"
                      style={{ boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.2)' }}
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-600 font-medium mt-2">
                      Examples: 60540, Chicago IL, Los Angeles CA
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !location.trim()}
                    className="w-full bg-gray-800 text-white px-8 py-4 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-black text-lg transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1 disabled:hover:translate-x-0 disabled:hover:translate-y-0 border-4 border-black"
                    style={{ boxShadow: '6px 6px 0px #000000' }}
                    onMouseDown={(e) => {
                      if (!loading && location.trim()) {
                        e.currentTarget.style.boxShadow = '3px 3px 0px #000000';
                      }
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.boxShadow = '6px 6px 0px #000000';
                    }}
                  >
                    {loading ? 'Searching...' : 'Find Best Times'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center">
              <div style={{ backgroundColor: '#ffe6e6', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }} className="p-8 mb-6">
                <h3 className="text-2xl font-black text-red-800 mb-3">⚠ Error</h3>
                <p className="text-red-700 font-bold text-lg">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setLocation('');
                }}
                style={{ backgroundColor: '#8b7355', boxShadow: '6px 6px 0px #000000', border: '4px solid #000000' }}
                className="text-white px-8 py-4 hover:bg-opacity-90 font-black text-lg transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results */}
          {data && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Best Stargazing Times
                </h2>
                <p className="text-xl text-gray-600 font-bold">📍 {data.location}</p>
              </div>

              {data.windows.length === 0 ? (
                <div className="text-center">
                  <div style={{ backgroundColor: '#fff4d6', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }} className="p-8">
                    <h3 className="text-2xl font-black text-yellow-800 mb-3">☁ No Clear Skies</h3>
                    <p className="text-yellow-700 font-bold text-lg">
                      Weather conditions aren&apos;t ideal for stargazing in the next 72 hours. Check back later!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {data.windows.map((window: TimeWindow, index: number) => {
                    const cloudBadge = getCloudBadge(window.weather.cloud);
                    const moonTag = getMoonImpactTag(window.moon.impact);

                    return (
                      <div
                        key={index}
                        style={{ backgroundColor: '#f5f2e8', border: '4px solid #000000', boxShadow: '8px 8px 0px #000000' }}
                        className="p-6 transition-all duration-300"
                      >
                        {/* Time Range Header */}
                        <div className="text-center mb-6 pb-4" style={{ borderBottom: '4px solid #000000' }}>
                          <h3 className="text-2xl font-black text-gray-900 mb-3">
                            {window.start} - {window.end}
                          </h3>
                          <span 
                            className={`inline-block px-6 py-3 text-lg font-black ${cloudBadge.color}`} 
                            style={{ boxShadow: '4px 4px 0px #000000', border: '4px solid #000000' }}
                          >
                            {cloudBadge.text} ({window.weather.cloud}%)
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Weather Section */}
                          <div style={{ backgroundColor: '#faf8f3', border: '4px solid #000000', boxShadow: '4px 4px 0px #000000' }} className="p-6">
                            <h4 className="text-xl font-black text-gray-900 mb-4 text-center">🌡 Weather</h4>
                            <div className="space-y-4">
                              <div style={{ backgroundColor: '#f0ede5', border: '2px solid #000000' }} className="flex justify-between items-center p-3">
                                <span className="font-black text-gray-700 text-lg">Temperature:</span>
                                <span className="font-black text-gray-900 text-xl">{window.weather.temp}°F</span>
                              </div>
                              <div style={{ backgroundColor: '#f0ede5', border: '2px solid #000000' }} className="flex justify-between items-center p-3">
                                <span className="font-black text-gray-700 text-lg">Wind:</span>
                                <span className="font-black text-gray-900 text-xl">{window.weather.wind} mph</span>
                              </div>
                            </div>
                          </div>

                          {/* Moon Section */}
                          <div style={{ backgroundColor: '#faf8f3', border: '4px solid #000000', boxShadow: '4px 4px 0px #000000' }} className="p-6">
                            <div className="text-center mb-4">
                              <h4 className="text-xl font-black text-gray-900">🌙 Moon</h4>
                            </div>
                            <div className="text-center mb-4">
                              <span className={`px-4 py-2 text-sm font-black border-4 border-black ${moonTag}`} style={{ boxShadow: '3px 3px 0px #000000' }}>
                                {window.moon.impact} Impact
                              </span>
                            </div>
                            <div className="space-y-2 text-center">
                              <div className="font-black text-gray-900 text-lg">{window.moon.phase}</div>
                              <div className="font-bold text-gray-700">{window.moon.illum}% illuminated</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                          {/* Planets Section */}
                          <div style={{ backgroundColor: '#faf8f3', border: '4px solid #000000', boxShadow: '4px 4px 0px #000000' }} className="p-6">
                            <h4 className="text-xl font-black text-gray-900 mb-4 text-center">● Planets</h4>
                            {window.planets.length > 0 ? (
                              <div className="flex flex-wrap gap-3 justify-center">
                                {window.planets.map((planet: string, i: number) => (
                                  <span
                                    key={i}
                                    style={{ backgroundColor: '#6b83d6', border: '4px solid #000000', boxShadow: '3px 3px 0px #000000' }}
                                    className="inline-block px-4 py-2 text-white font-black transition-transform hover:translate-x-1 hover:translate-y-1"
                                  >
                                    {planet}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 font-bold text-center italic text-lg">None visible</p>
                            )}
                          </div>

                          {/* Stars Section */}
                          <div style={{ backgroundColor: '#faf8f3', border: '4px solid #000000', boxShadow: '4px 4px 0px #000000' }} className="p-6">
                            <h4 className="text-xl font-black text-gray-900 mb-4 text-center">★ Stars</h4>
                            {window.stars.length > 0 ? (
                              <div className="flex flex-wrap gap-3 justify-center">
                                {window.stars.map((star: string, i: number) => (
                                  <span
                                    key={i}
                                    style={{ backgroundColor: '#9d6bd6', border: '4px solid #000000', boxShadow: '3px 3px 0px #000000' }}
                                    className="inline-block px-4 py-2 text-white font-black transition-transform hover:translate-x-1 hover:translate-y-1"
                                  >
                                    {star}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 font-bold text-center italic text-lg">None visible</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setData(null);
                    setLocation('');
                  }}
                  style={{ backgroundColor: '#8b7355', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }}
                  className="text-white px-8 py-4 hover:bg-opacity-90 font-black text-lg transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1"
                >
                  Search New Location
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">
            Data provided by Astrospheric API and Open-Meteo.<br/>
            Times shown are for the next 72 hours in your local timezone.
          </p>
        </div>
      </div>
    </div>
  );
}
