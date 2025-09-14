'use client';

import { useWeather } from '@/contexts/WeatherContext';

interface StargazingWindow {
  start: string;
  end: string;
  weather: {
    temp: number;
    wind: number;
    cloud: number;
  };
  moon: {
    phase: string;
    illum: number;
    impact: string;
  };
  planets: string[];
  stars: string[];
}

interface StargazingData {
  location: string;
  windows: StargazingWindow[];
}

interface InlineResultsProps {
  data: StargazingData | null;
  loading: boolean;
  error: string | null;
}

export default function InlineResults({ data, loading, error }: InlineResultsProps) {
  const { formatTemperature } = useWeather();

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="text-center py-12 rounded-lg border-2 bg-white/80 border-gray-300 text-gray-900 backdrop-blur-sm">
          <div className="text-2xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            Searching the cosmos...
          </h3>
          <p className="text-gray-600">
            Finding the best stargazing times for you
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="text-center py-12 rounded-lg border-2 bg-red-50 border-red-300 text-red-900 backdrop-blur-sm">
          <div className="text-2xl mb-4">❌</div>
          <h3 className="text-xl font-bold mb-2 text-red-900">
            Something went wrong
          </h3>
          <p className="text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getCloudBadge = (cloudCover: number) => {
    if (cloudCover <= 20) return { text: 'Excellent', color: 'bg-green-500' };
    if (cloudCover <= 40) return { text: 'Good', color: 'bg-blue-500' };
    if (cloudCover <= 60) return { text: 'Fair', color: 'bg-yellow-500' };
    return { text: 'Poor', color: 'bg-red-500' };
  };

  const getMoonTag = (impact: string) => {
    if (impact === 'Low') return 'bg-green-500';
    if (impact === 'Medium') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      {/* Results Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Best Stargazing Times
        </h2>
        <p className="text-lg text-gray-600">
          📍 {data.location}
        </p>
      </div>

      {/* Results Content */}
      {data.windows.length === 0 ? (
        <div className="text-center py-12 rounded-lg border-2 bg-yellow-50 border-yellow-300 backdrop-blur-sm">
          <div className="text-2xl mb-4">☁️</div>
          <h3 className="text-xl font-bold mb-2 text-yellow-800">
            No Clear Skies
          </h3>
          <p className="text-yellow-700">
            Weather conditions aren&apos;t ideal for stargazing in the next 72 hours. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.windows.map((window, index) => {
            const cloudBadge = getCloudBadge(window.weather.cloud);
            const moonTag = getMoonTag(window.moon.impact);

            return (
              <div
                key={index}
                className="p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 bg-white/90 border-gray-300 hover:border-blue-400 backdrop-blur-sm shadow-lg"
              >
                {/* Time Range Header */}
                <div className="text-center mb-4 pb-4 border-b border-gray-300">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {window.start} - {window.end}
                  </h3>
                  <span 
                    className={`inline-block px-3 py-1 text-sm font-bold text-white rounded ${cloudBadge.color}`}
                  >
                    {cloudBadge.text} ({window.weather.cloud}%)
                  </span>
                </div>

                {/* Weather Section */}
                <div className="mb-4 p-3 rounded border bg-gray-50 border-gray-200">
                  <h4 className="text-sm font-bold mb-2 text-gray-900">
                    🌡️ Weather
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Temp:</span>
                    <span className="font-semibold text-gray-900">
                      {formatTemperature(window.weather.temp)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Wind:</span>
                    <span className="font-semibold text-gray-900">
                      {window.weather.wind} mph
                    </span>
                  </div>
                </div>

                {/* Moon Section */}
                <div className="mb-4 p-3 rounded border bg-gray-50 border-gray-200">
                  <h4 className="text-sm font-bold mb-2 text-gray-900">
                    🌙 Moon
                  </h4>
                  <div className="text-center mb-2">
                    <span className={`px-2 py-1 text-xs font-bold text-white rounded ${moonTag}`}>
                      {window.moon.impact} Impact
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-sm text-gray-900">
                      {window.moon.phase}
                    </div>
                    <div className="text-xs text-gray-600">
                      {window.moon.illum}% illuminated
                    </div>
                  </div>
                </div>

                {/* Planets Section */}
                <div className="mb-4 p-3 rounded border bg-gray-50 border-gray-200">
                  <h4 className="text-sm font-bold mb-2 text-gray-900">
                    🪐 Planets
                  </h4>
                  {window.planets.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {window.planets.map((planet: string, i: number) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded"
                        >
                          {planet}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500">
                      None visible
                    </p>
                  )}
                </div>

                {/* Stars Section */}
                <div className="p-3 rounded border bg-gray-50 border-gray-200">
                  <h4 className="text-sm font-bold mb-2 text-gray-900">
                    ⭐ Stars
                  </h4>
                  {window.stars.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {window.stars.map((star: string, i: number) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 text-xs font-bold text-white bg-purple-500 rounded"
                        >
                          {star}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500">
                      None visible
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}