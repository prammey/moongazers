'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

// Country data with common postal/ZIP code formats
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', placeholder: '12345 or 12345-6789', example: '60540' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', placeholder: 'A1A 1A1', example: 'M5V 3A8' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', placeholder: 'SW1A 1AA', example: 'SW1A 1AA' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', placeholder: '1000', example: '2000' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', placeholder: '12345', example: '10115' },
  { code: 'FR', name: 'France', flag: '🇫🇷', placeholder: '75001', example: '75001' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', placeholder: '100-0001', example: '100-0001' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', placeholder: '00100', example: '00100' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', placeholder: '28001', example: '28001' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', placeholder: '1000 AA', example: '1012 JS' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', placeholder: '123 45', example: '111 29' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', placeholder: '0001', example: '0150' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', placeholder: '1000', example: '1050' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', placeholder: '1000', example: '8001' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', placeholder: '1010', example: '1010' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', placeholder: '1000', example: '1000' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', placeholder: '1010', example: '1010' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', placeholder: 'D01 F5P2', example: 'D01 F5P2' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', placeholder: '00100', example: '00100' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', placeholder: '00-001', example: '00-001' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', placeholder: '01000-000', example: '01310-100' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', placeholder: '01000', example: '06600' },
  { code: 'IN', name: 'India', flag: '🇮🇳', placeholder: '110001', example: '110001' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', placeholder: '018956', example: '018956' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', placeholder: '0001', example: '8001' },
];

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const [location, setLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to US
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Combine postal code with country for better geocoding
      let searchLocation = location.trim();
      
      // If it looks like a postal/ZIP code, add country context
      const isPostalCode = /^[A-Za-z0-9\s\-]{3,10}$/.test(searchLocation) && !searchLocation.includes(',');
      if (isPostalCode && selectedCountry) {
        searchLocation = `${searchLocation}, ${selectedCountry.name}`;
      }

      // Navigate to results page with search parameters
      const params = new URLSearchParams({
        location: searchLocation,
        country: selectedCountry.code
      });
      
      router.push(`/results?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-300" 
      style={{ 
        backgroundColor: theme === 'light' ? '#fff2cc' : '#1a1a1a'
      }}
    >
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        
        {/* Progress Bar */}
        {loading && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Searching...</span>
              <span className={`text-sm font-bold ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Finding best times</span>
            </div>
            <div className={`w-full h-3 shadow-lg ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'}`}>
              <div className={`h-3 w-2/3 animate-pulse shadow-inner ${theme === 'light' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div 
          style={{ 
            backgroundColor: theme === 'light' ? '#f8f6f0' : '#2d2d2d', 
            boxShadow: theme === 'light' ? '8px 8px 0px #000000' : '8px 8px 0px #000000', 
            border: theme === 'light' ? '4px solid #000000' : '4px solid #666666' 
          }} 
          className="p-8 mb-8 transition-all duration-300"
        >
          
          {!error && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className={`text-4xl font-black mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Moongazers
                </h1>
                <p className={`text-xl font-bold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                  Find the best stargazing times in your area
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="space-y-6">
                  
                  {/* Country Selection */}
                  <div>
                    <label className={`block text-lg font-black mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Select your country
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className={`w-full px-6 py-4 border-4 focus:ring-0 font-bold text-lg text-left flex items-center justify-between transition-colors ${
                          theme === 'light' 
                            ? 'border-gray-300 focus:border-gray-600 text-black bg-white hover:bg-gray-50' 
                            : 'border-gray-600 focus:border-gray-400 text-white bg-gray-800 hover:bg-gray-700'
                        }`}
                        style={{ boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.2)' }}
                        disabled={loading}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{selectedCountry.flag}</span>
                          <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{selectedCountry.name}</span>
                        </span>
                        <span className={`font-bold ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {showCountryDropdown ? '▲' : '▼'}
                        </span>
                      </button>
                      
                      {/* Dropdown */}
                      {showCountryDropdown && (
                        <div 
                          className={`absolute z-[100] w-full mt-2 border-4 max-h-64 overflow-hidden shadow-2xl ${
                            theme === 'light' 
                              ? 'bg-white border-black' 
                              : 'bg-gray-800 border-gray-600'
                          }`}
                          style={{ boxShadow: '6px 6px 0px #000000' }}
                        >
                          {/* Search Input */}
                          <div className={`p-3 border-b-2 ${
                            theme === 'light' 
                              ? 'border-gray-200 bg-gray-50' 
                              : 'border-gray-600 bg-gray-700'
                          }`}>
                            <input
                              type="text"
                              placeholder="🔍 Search countries..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className={`w-full px-3 py-2 border-2 focus:ring-0 font-medium rounded ${
                                theme === 'light'
                                  ? 'border-gray-300 focus:border-blue-500 text-black placeholder:text-gray-500 bg-white'
                                  : 'border-gray-600 focus:border-blue-400 text-white placeholder:text-gray-400 bg-gray-900'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                          
                          {/* Country Options */}
                          <div className="max-h-48 overflow-y-auto bg-white">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryDropdown(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 font-medium transition-all duration-200 border-b border-gray-100 ${
                                  selectedCountry.code === country.code ? 'bg-blue-100 text-blue-900 border-blue-200' : 'text-gray-900 hover:text-blue-700'
                                }`}
                              >
                                <span className="text-xl flex-shrink-0">{country.flag}</span>
                                <span className="font-semibold text-gray-900 flex-1">{country.name}</span>
                                <span className="text-gray-500 text-sm font-medium">({country.code})</span>
                              </button>
                            ))}
                            {filteredCountries.length === 0 && (
                              <div className="px-4 py-6 text-gray-500 text-center font-medium">
                                <div className="text-2xl mb-2">🌍</div>
                                <div>No countries found</div>
                                <div className="text-sm mt-1">Try a different search term</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Input */}
                  <div>
                    <label className="block text-lg font-black text-gray-900 mb-3">
                      Enter postal/ZIP code or city
                    </label>
                    <input
                      type="text"
                      placeholder={selectedCountry.placeholder}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-6 py-4 border-4 border-gray-300 focus:ring-0 focus:border-gray-600 text-black placeholder:text-gray-500 font-bold text-lg"
                      style={{ boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.2)' }}
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-600 font-medium mt-2">
                      Example for {selectedCountry.name}: {selectedCountry.example}
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
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">🌙</span>
                        Searching {selectedCountry.name}...
                      </span>
                    ) : (
                      'Find Best Times'
                    )}
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
