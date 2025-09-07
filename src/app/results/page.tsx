'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { BestWindowsResponse, TimeWindow } from '@/types';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<BestWindowsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = searchParams.get('location');
  const country = searchParams.get('country');

  useEffect(() => {
    if (!location || !country) {
      router.push('/');
      return;
    }

    const fetchStargazingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/best-windows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stargazing data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStargazingData();
  }, [location, country, router]);

  const retryFetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/best-windows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stargazing data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCloudBadge = (cloudCover: number) => {
    if (cloudCover <= 20) return { text: '☀ Excellent', color: 'bg-green-400 text-green-900' };
    if (cloudCover <= 40) return { text: '⛅ Good', color: 'bg-blue-400 text-blue-900' };
    if (cloudCover <= 60) return { text: '☁ Fair', color: 'bg-yellow-400 text-yellow-900' };
    return { text: '☁ Poor', color: 'bg-red-400 text-red-900' };
  };

  const getMoonImpactTag = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'low': return 'bg-green-400 text-green-900';
      case 'medium': return 'bg-yellow-400 text-yellow-900';
      case 'high': return 'bg-red-400 text-red-900';
      default: return 'bg-gray-400 text-gray-900';
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'CA': '🇨🇦',
      'GB': '🇬🇧',
      'AU': '🇦🇺',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'JP': '🇯🇵',
      'IT': '🇮🇹',
      'ES': '🇪🇸',
      'NL': '🇳🇱',
      'SE': '🇸🇪',
      'NO': '🇳🇴',
      'DK': '🇩🇰',
      'CH': '🇨🇭',
      'AT': '🇦🇹',
      'BE': '🇧🇪',
      'NZ': '🇳🇿',
      'IE': '🇮🇪',
      'FI': '🇫🇮',
      'PL': '🇵🇱',
      'BR': '🇧🇷',
      'MX': '🇲🇽',
      'IN': '🇮🇳',
      'SG': '🇸🇬',
      'ZA': '🇿🇦',
    };
    return flags[countryCode] || '🌍';
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fef7ed' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-8 border-gray-300 border-t-gray-900 mx-auto mb-8"></div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Finding Perfect Stargazing Times...
            </h2>
            <p className="text-xl text-gray-600 font-bold">
              {getCountryFlag(country || '')} Analyzing conditions for {location}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fef7ed' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-3xl font-black text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-xl text-gray-600 font-bold mb-8">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/')}
                style={{ backgroundColor: '#8b7355', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }}
                className="text-white px-8 py-4 hover:bg-opacity-90 font-black text-lg transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1"
              >
                Back to Search
              </button>
              <button
                onClick={retryFetch}
                style={{ backgroundColor: '#4a90e2', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }}
                className="text-white px-8 py-4 hover:bg-opacity-90 font-black text-lg transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fef7ed' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-4">No Data Available</h2>
            <button
              onClick={() => router.push('/')}
              style={{ backgroundColor: '#8b7355', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }}
              className="text-white px-8 py-4 hover:bg-opacity-90 font-black text-lg transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef7ed' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            style={{ backgroundColor: '#8b7355', border: '4px solid #000000', boxShadow: '4px 4px 0px #000000' }}
            className="text-white px-6 py-3 hover:bg-opacity-90 font-black text-base transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1 mb-6"
          >
            ← Back to Search
          </button>
        </div>

        {/* Results Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Best Stargazing Times
          </h1>
          <p className="text-2xl text-gray-600 font-bold flex items-center justify-center gap-3">
            <span className="text-3xl">{getCountryFlag(country || '')}</span>
            {data.location}
          </p>
        </div>

        {/* Results Content */}
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
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {data.windows.map((window: TimeWindow, index: number) => {
              const cloudBadge = getCloudBadge(window.weather.cloud);
              const moonTag = getMoonImpactTag(window.moon.impact);

              return (
                <div
                  key={index}
                  style={{ backgroundColor: '#f5f2e8', border: '4px solid #000000', boxShadow: '8px 8px 0px #000000' }}
                  className="p-6 transition-all duration-300 hover:transform hover:translate-x-1 hover:translate-y-1"
                >
                  {/* Time Range Header */}
                  <div className="text-center mb-6 pb-4" style={{ borderBottom: '4px solid #000000' }}>
                    <h3 className="text-xl font-black text-gray-900 mb-3">
                      {window.start} - {window.end}
                    </h3>
                    <span 
                      className={`inline-block px-4 py-2 text-sm font-black ${cloudBadge.color}`} 
                      style={{ boxShadow: '3px 3px 0px #000000', border: '3px solid #000000' }}
                    >
                      {cloudBadge.text} ({window.weather.cloud}%)
                    </span>
                  </div>

                  {/* Weather Section */}
                  <div style={{ backgroundColor: '#faf8f3', border: '3px solid #000000', boxShadow: '3px 3px 0px #000000' }} className="p-4 mb-4">
                    <h4 className="text-lg font-black text-gray-900 mb-3 text-center">🌡 Weather</h4>
                    <div className="space-y-3">
                      <div style={{ backgroundColor: '#f0ede5', border: '2px solid #000000' }} className="flex justify-between items-center p-3">
                        <span className="font-black text-gray-700">Temp:</span>
                        <span className="font-black text-gray-900">{window.weather.temp}°F</span>
                      </div>
                      <div style={{ backgroundColor: '#f0ede5', border: '2px solid #000000' }} className="flex justify-between items-center p-3">
                        <span className="font-black text-gray-700">Wind:</span>
                        <span className="font-black text-gray-900">{window.weather.wind} mph</span>
                      </div>
                    </div>
                  </div>

                  {/* Moon Section */}
                  <div style={{ backgroundColor: '#faf8f3', border: '3px solid #000000', boxShadow: '3px 3px 0px #000000' }} className="p-4 mb-4">
                    <h4 className="text-lg font-black text-gray-900 text-center mb-3">🌙 Moon</h4>
                    <div className="text-center mb-3">
                      <span className={`px-3 py-1 text-xs font-black border-3 border-black ${moonTag}`} style={{ boxShadow: '2px 2px 0px #000000' }}>
                        {window.moon.impact} Impact
                      </span>
                    </div>
                    <div className="space-y-1 text-center">
                      <div className="font-black text-gray-900">{window.moon.phase}</div>
                      <div className="font-bold text-gray-700 text-sm">{window.moon.illum}% illuminated</div>
                    </div>
                  </div>

                  {/* Planets Section */}
                  <div style={{ backgroundColor: '#faf8f3', border: '3px solid #000000', boxShadow: '3px 3px 0px #000000' }} className="p-4 mb-4">
                    <h4 className="text-lg font-black text-gray-900 mb-3 text-center">● Planets</h4>
                    {window.planets.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {window.planets.map((planet: string, i: number) => (
                          <span
                            key={i}
                            style={{ backgroundColor: '#6b83d6', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                            className="inline-block px-3 py-1 text-white font-black text-sm"
                          >
                            {planet}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 font-bold text-center italic">None visible</p>
                    )}
                  </div>

                  {/* Stars Section */}
                  <div style={{ backgroundColor: '#faf8f3', border: '3px solid #000000', boxShadow: '3px 3px 0px #000000' }} className="p-4">
                    <h4 className="text-lg font-black text-gray-900 mb-3 text-center">★ Stars</h4>
                    {window.stars.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {window.stars.map((star: string, i: number) => (
                          <span
                            key={i}
                            style={{ backgroundColor: '#9d6bd6', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                            className="inline-block px-3 py-1 text-white font-black text-sm"
                          >
                            {star}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 font-bold text-center italic">None visible</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Search Button
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/')}
            style={{ backgroundColor: '#8b7355', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }}
            className="text-white px-8 py-4 hover:bg-opacity-90 font-black text-lg transition-all duration-200 transform hover:translate-x-1 hover:translate-y-1"
          >
            Search New Location
          </button>
        </div> */}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 font-medium">
            Data provided by Astrospheric API and Open-Meteo.<br/>
            Times shown are for the next 72 hours in your local timezone.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef7ed' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-8 border-gray-300 border-t-gray-900 mx-auto mb-8"></div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Loading Results...
          </h2>
          <p className="text-xl text-gray-600 font-bold">
            Please wait while we prepare your stargazing data
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsContent />
    </Suspense>
  );
}
