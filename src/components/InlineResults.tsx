"use client";

import { useWeather } from "@/contexts/WeatherContext";

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
  // IANA zone of the searched location, e.g. "America/Denver"
  timezone?: string;
  windows: StargazingWindow[];
}

interface InlineResultsProps {
  data: StargazingData | null;
  loading: boolean;
  error: string | null;
}

export default function InlineResults({
  data,
  loading,
  error,
}: InlineResultsProps) {
  const { formatTemperature, formatTime } = useWeather();

  // Windows are shown in the searched location's time zone (that's where
  // you'll be stargazing); if the viewer is in a different zone, their own
  // local time is shown underneath.
  const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locationZone = data?.timezone || viewerZone;

  const formatNight = (iso: string, timeZone: string): string =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone,
    });

  const zoneLabel = (iso: string, timeZone: string): string =>
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
      .formatToParts(new Date(iso))
      .find((part) => part.type === "timeZoneName")?.value ?? "";

  const formatTimeRange = (startIso: string, endIso: string, timeZone: string): string =>
    `${formatTime(new Date(startIso), timeZone)} – ${formatTime(new Date(endIso), timeZone)} ${zoneLabel(startIso, timeZone)}`;

  const formatViewerRange = (startIso: string, endIso: string): string | null => {
    const local = `${formatNight(startIso, locationZone)} ${formatTimeRange(startIso, endIso, locationZone)}`;
    const viewer = `${formatNight(startIso, viewerZone)} ${formatTimeRange(startIso, endIso, viewerZone)}`;
    if (local === viewer) return null;
    return `${formatNight(startIso, viewerZone)}, ${formatTimeRange(startIso, endIso, viewerZone)}`;
  };

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
        <div
          className="text-center py-12 px-8 rounded-xl bg-white/90 border border-gray-200 text-gray-700 backdrop-blur-sm shadow-lg"
          style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
        >
          <div className="text-3xl mb-6 text-gray-400">✕</div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Unable to fetch stargazing data
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
            {error}
          </p>
          <p className="text-gray-500 text-xs mt-4">
            Please try again with a different location or check your connection.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getCloudBadge = (cloudCover: number) => {
    if (cloudCover <= 15)
      return { text: "No Cloud Coverage", color: "bg-green-500" };
    if (cloudCover <= 35)
      return { text: "Low Cloud Coverage", color: "bg-blue-500" };
    if (cloudCover <= 60)
      return { text: "Medium Cloud Coverage", color: "bg-yellow-500" };
    return { text: "High Cloud Coverage", color: "bg-red-500" };
  };

  const getMoonTag = (impact: string) => {
    if (impact === "Low") return "bg-green-500";
    if (impact === "Medium") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      {/* Results Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl mb-2 text-gray-900">Best Stargazing Times</h2>
        <p className="text-lg text-gray-600">📍 {data.location}</p>
        {data.windows.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Times are local to this location ({zoneLabel(data.windows[0].start, locationZone)})
          </p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Cloud cover: 0–15% none · 16–35% low · 36–60% medium · 60%+ high.
          Moon data calculated with Astronomy Engine.
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
            Weather conditions aren&apos;t ideal for stargazing in the next 72
            hours. Check back later!
          </p>
        </div>
      ) : (
        <div
          className={`${
            data.windows.length === 1
              ? "flex justify-center"
              : data.windows.length === 2
              ? "flex flex-col md:flex-row justify-center gap-6"
              : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {data.windows.map((window, index) => {
            const cloudBadge = getCloudBadge(window.weather.cloud);
            const moonTag = getMoonTag(window.moon.impact);

            return (
              <div
                key={index}
                className={`p-5 sm:p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-violet-300 bg-white shadow-md ${
                  data.windows.length <= 2 ? "w-full max-w-sm" : ""
                }`}
              >
                {/* Time Range Header */}
                <div className="text-center mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    {formatNight(window.start, locationZone)}
                  </h3>
                  <p className="text-base font-semibold text-gray-800 mb-1">
                    {formatTimeRange(window.start, window.end, locationZone)}
                  </p>
                  {formatViewerRange(window.start, window.end) && (
                    <p className="text-xs text-gray-500 mb-2">
                      Your time: {formatViewerRange(window.start, window.end)}
                    </p>
                  )}
                  <div className="mb-2" />
                  <span
                    className={`inline-block px-3 py-1 text-sm font-bold text-white rounded ${cloudBadge.color}`}
                  >
                    {cloudBadge.text} ({window.weather.cloud}%)
                  </span>
                </div>

                {/* Weather Section */}
                <div className="mb-3 p-3 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-bold mb-2 text-gray-900">
                    🌡️ Weather
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Temp:</span>
                    <span className="font-semibold text-gray-900">
                      {formatTemperature(window.weather.temp, 'celsius')}
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
                <div className="mb-3 p-3 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-bold mb-2 text-gray-900">
                    🌙 Moon
                  </h4>
                  <div className="text-center mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-bold text-white rounded ${moonTag}`}
                    >
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
                <div className="mb-3 p-3 rounded-lg bg-gray-50">
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
                    <p className="text-xs italic text-gray-500">None visible</p>
                  )}
                </div>

                {/* Stars Section */}
                <div className="p-3 rounded-lg bg-gray-50">
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
                    <p className="text-xs italic text-gray-500">None visible</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mt-10 text-xs sm:text-sm px-4 py-4 rounded-lg bg-gray-50 border border-gray-100">
        <p className="text-gray-600 max-w-3xl mx-auto text-center leading-relaxed">
          Forecast data from Astrospheric and Open-Meteo; transformed for astronomy use. Results are provided &ldquo;as is&rdquo; and may be inaccurate or outdated. This tool is educational and not for operational or commercial use. Not affiliated with or endorsed by Astrospheric or Open-Meteo.
        </p>
      </div>
    </div>
  );
}
