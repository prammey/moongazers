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
    <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50">
      <div className="text-black">
        {/* URL Link */}
        <div className="text-xs sm:text-sm md:text-base font-bold mb-1" style={{ 
          color: '#000000',
          fontFamily: "'Kosugi Maru', cursive"
        }}>
          https://moongazers.prameet.space/
        </div>
        
        {/* Date, Time, and Temperature on same line */}
        <div className="text-xs sm:text-sm md:text-base font-bold mb-2" style={{ 
          color: '#000000',
          fontFamily: "'Kosugi Maru', cursive"
        }}>
          {formatDate(currentTime)} {formatTime(currentTime)} {weatherData && (
            <>
              <span style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>☁️</span> {formatTemperature(weatherData.temperature, 'celsius')}
            </>
          )}
        </div>

        {/* Removed separate weather info section */}
      </div>
    </div>
  );
}