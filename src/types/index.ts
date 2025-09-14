export interface WeatherData {
  cloud: number;
  temp: number;
  wind: number;
}

export interface MoonData {
  phase: string;
  illum: number;
  impact: 'Low' | 'Medium' | 'High';
}

export interface TimeWindow {
  start: string;
  end: string;
  weather: WeatherData;
  moon: MoonData;
  planets: string[];
  stars: string[];
}

export interface CurrentWeatherData {
  temperature: number;
  cloudCover: number;
  skyQuality: string;
}

export interface BestWindowsResponse {
  location: string;
  windows: TimeWindow[];
  currentWeather?: CurrentWeatherData | null;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  location: string;
}

// Astrospheric API types
export interface AstrosphericForecastData {
  data: {
    hourly: {
      time: string[];
      cloudcover: number[];
      temperature_2m: number[];
      wind_speed_10m: number[];
    };
    daily: {
      sunrise: string[];
      sunset: string[];
    };
  };
}

export interface AstrosphericSkyObject {
  name: string;
  type: number; // 0 = star, 1 = planet
  alt: number;
  mag?: number;
}

export interface AstrosphericSkyData {
  data: {
    objects: AstrosphericSkyObject[];
    moon: {
      phase: string;
      illumination: number;
      altitude: number;
    };
  };
}

// Open-Meteo API types
export interface OpenMeteoForecast {
  timezone: string;
  hourly: {
    time: string[];
    cloudcover: number[];
    temperature_2m: number[];
    wind_speed_10m: number[];
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

// Bright stars data
export interface BrightStar {
  name: string;
  ra: number;
  dec: number;
  mag: number;
}

// Time slot scoring
export interface TimeSlot {
  time: Date;
  cloudCover: number;
  temperature: number;
  windSpeed: number;
  score: number;
  isNight: boolean;
}

export interface GroupedWindow {
  startTime: Date;
  endTime: Date;
  avgScore: number;
  slots: TimeSlot[];
}
