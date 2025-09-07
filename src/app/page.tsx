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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌙 Moongazers
          </h1>
          <p className="text-lg text-gray-600">
            Find the best stargazing times in your area
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Enter ZIP code or city name (US only)
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., 60540 or Naperville, IL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !location.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Find Best Times'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Best Moongazing Times
              </h2>
              <p className="text-gray-600">📍 {data.location}</p>
            </div>

            {data.windows.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No good stargazing windows found in the next 72 hours. Try again later!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.windows.map((window: TimeWindow, index: number) => {
                  const cloudBadge = getCloudBadge(window.weather.cloud);
                  const moonTag = getMoonImpactTag(window.moon.impact);

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                    >
                      {/* Time Range */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {window.start} - {window.end}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${cloudBadge.color}`}>
                          {cloudBadge.text} ({window.weather.cloud}%)
                        </span>
                      </div>

                      {/* Weather */}
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Temperature:</span>
                          <span className="font-medium">{window.weather.temp}°F</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Wind:</span>
                          <span className="font-medium">{window.weather.wind} mph</span>
                        </div>
                      </div>

                      {/* Moon */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Moon:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${moonTag}`}>
                            {window.moon.impact} Impact
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{window.moon.phase}</span>
                          <span className="text-gray-600"> ({window.moon.illum}% illuminated)</span>
                        </div>
                      </div>

                      {/* Planets */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Visible Planets</h4>
                        {window.planets.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {window.planets.map((planet: string, i: number) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {planet}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">None visible</p>
                        )}
                      </div>

                      {/* Stars */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Bright Stars</h4>
                        {window.stars.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {window.stars.slice(0, 6).map((star: string, i: number) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                              >
                                {star}
                              </span>
                            ))}
                            {window.stars.length > 6 && (
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{window.stars.length - 6} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">None visible</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-600">
          <p>
            Data provided by Astrospheric API and Open-Meteo. 
            Times shown are for the next 72 hours in your local timezone.
          </p>
        </div>
      </div>
    </div>
  );
}
