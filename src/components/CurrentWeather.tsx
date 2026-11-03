'use client';

import { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';

// The visitor's own clock and temperature, not the searched place's
export default function CurrentWeather() {
  const { formatTime, formatTemperature } = useWeather();
  // Start empty and fill in after mount: the server's clock never matches the
  // browser's, which caused a React hydration error (#418)
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/local-weather')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.temperature === 'number') setTemperature(data.temperature);
      })
      .catch(() => {});
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
        {/* Date and Time on same line */}
        <div className="text-xs sm:text-sm md:text-base font-bold mb-2" style={{ 
          color: '#000000',
          fontFamily: "'Kosugi Maru', sans-serif"
        }}>
          {currentTime ? `${formatDate(currentTime)} ${formatTime(currentTime)}` : "\u00a0"}{" "}
          {temperature !== null && (
            <>
              <span style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>☁️</span> {formatTemperature(temperature, 'celsius')}
            </>
          )}
        </div>

        {/* Removed separate weather info section */}
      </div>
    </div>
  );
}