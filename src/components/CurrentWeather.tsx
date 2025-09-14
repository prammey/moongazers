'use client';

import { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';

interface CurrentWeatherData {
  location: string;
  temperature: number;
  skyQuality: string;
}

interface CurrentWeatherProps {
  weatherData?: CurrentWeatherData;
}

export default function CurrentWeather({ weatherData }: CurrentWeatherProps) {
  const { formatTime, formatTemperature } = useWeather();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
      <div className="text-black">
        {/* URL Link */}
        <div className="text-xs sm:text-sm font-bold mb-1" style={{ 
          color: '#000000',
          fontFamily: "'Kosugi Maru', cursive"
        }}>
          https://moongazers.xyz/
        </div>
        
        {/* Date and Time on same line */}
        <div className="text-xs sm:text-sm font-bold mb-2" style={{ 
          color: '#000000',
          fontFamily: "'Kosugi Maru', cursive"
        }}>
          {formatDate(currentTime)} {formatTime(currentTime)}
        </div>

        {/* Current Weather Info */}
        {weatherData && (
          <>
            <div className="text-xs sm:text-sm font-medium mb-1">
              {formatTemperature(weatherData.temperature)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full mr-1 sm:mr-2"></span>
              <span className="text-xs sm:text-sm">WANING CRESCENT</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}