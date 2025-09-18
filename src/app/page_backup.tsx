'use client';

import { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import LandingPage from '@/components/LandingPage';

// Simplified version to test structure
export default function Home() {
  const { temperatureUnit, timeFormat, toggleTemperatureUnit, toggleTimeFormat } = useWeather();
  const [showLandingPage, setShowLandingPage] = useState(true);

  const handleLaunchApp = () => {
    setShowLandingPage(false);
  };

  return (
    <div>
      {showLandingPage ? (
        <LandingPage onLaunch={handleLaunchApp} />
      ) : (
        <div 
          className="relative min-h-screen"
          style={{ 
            backgroundColor: '#ffffff'
          }}
        >
          <h1>Main App Content</h1>
          <p>This is where the main MoonGazers app would be displayed.</p>
        </div>
      )}
    </div>
  );
}