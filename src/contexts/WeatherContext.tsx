'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type TemperatureUnit = 'celsius' | 'fahrenheit';
type TimeFormat = '12hr' | '24hr';

interface WeatherContextType {
  temperatureUnit: TemperatureUnit;
  timeFormat: TimeFormat;
  toggleTemperatureUnit: () => void;
  toggleTimeFormat: () => void;
  convertTemperature: (temp: number, fromUnit?: TemperatureUnit) => number;
  formatTime: (date: Date) => string;
  formatTemperature: (temp: number, fromUnit?: TemperatureUnit) => string;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12hr');

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTempUnit = localStorage.getItem('temperatureUnit') as TemperatureUnit;
    const savedTimeFormat = localStorage.getItem('timeFormat') as TimeFormat;
    
    // Always default to Celsius if no saved preference
    if (savedTempUnit && (savedTempUnit === 'celsius' || savedTempUnit === 'fahrenheit')) {
      setTemperatureUnit(savedTempUnit);
    } else {
      setTemperatureUnit('celsius'); // Ensure Celsius is always the default
    }
    
    if (savedTimeFormat) {
      setTimeFormat(savedTimeFormat);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('temperatureUnit', temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat);
  }, [timeFormat]);

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const toggleTimeFormat = () => {
    setTimeFormat(prev => prev === '12hr' ? '24hr' : '12hr');
  };

  const convertTemperature = (temp: number, fromUnit: TemperatureUnit = 'fahrenheit'): number => {
    if (temperatureUnit === fromUnit) return Math.round(temp);
    
    if (fromUnit === 'fahrenheit' && temperatureUnit === 'celsius') {
      return Math.round((temp - 32) * (5/9));
    } else if (fromUnit === 'celsius' && temperatureUnit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    
    return Math.round(temp);
  };

  const formatTime = (date: Date): string => {
    if (timeFormat === '12hr') {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  const formatTemperature = (temp: number, fromUnit: TemperatureUnit = 'fahrenheit'): string => {
    const convertedTemp = convertTemperature(temp, fromUnit);
    const unit = temperatureUnit === 'celsius' ? '°C' : '°F';
    return `${convertedTemp}${unit}`;
  };

  return (
    <WeatherContext.Provider value={{
      temperatureUnit,
      timeFormat,
      toggleTemperatureUnit,
      toggleTimeFormat,
      convertTemperature,
      formatTime,
      formatTemperature
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}