/**
 * Real-Time Weather & Atmospheric Telemetry Service
 * Fetches live weather conditions for ANY searched location worldwide (lat, lng)
 * Using Open-Meteo API (Free, high-accuracy, zero API key requirement)
 * With intelligent offline fallback.
 */

export function getWindCardinal(deg) {
  if (deg == null || isNaN(deg)) return 'E';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export function decodeWeatherCode(code) {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: '☀️', severity: 'normal', color: 'text-amber-400' };
    case 1:
      return { condition: 'Mainly Clear', icon: '🌤️', severity: 'normal', color: 'text-amber-300' };
    case 2:
      return { condition: 'Partly Cloudy', icon: '⛅', severity: 'normal', color: 'text-cyan-300' };
    case 3:
      return { condition: 'Overcast', icon: '☁️', severity: 'normal', color: 'text-slate-300' };
    case 45:
    case 48:
      return { condition: 'Fog & Mist', icon: '🌫️', severity: 'advisory', color: 'text-blue-300' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', icon: '🌦️', severity: 'advisory', color: 'text-blue-400' };
    case 61:
    case 63:
      return { condition: 'Moderate Rain', icon: '🌧️', severity: 'moderate', color: 'text-blue-400' };
    case 65:
      return { condition: 'Heavy Downpour', icon: '⛈️', severity: 'warning', color: 'text-indigo-400' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', icon: '🌧️', severity: 'warning', color: 'text-cyan-400' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Severe Thunderstorm', icon: '⚡', severity: 'critical', color: 'text-rose-400' };
    default:
      return { condition: 'Partly Cloudy', icon: '⛅', severity: 'normal', color: 'text-cyan-300' };
  }
}

export function getFormattedLocalTime(timeZone = 'Asia/Kolkata') {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dateStr = now.toLocaleDateString('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return { timeStr, dateStr, full: `${timeStr} · ${dateStr}` };
  } catch (e) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = now.toDateString();
    return { timeStr, dateStr, full: `${timeStr} · ${dateStr}` };
  }
}

/**
 * Generates realistic meteorological fallback in case network is unavailable
 */
export function generateFallbackWeather(lat, lng, locationName = '') {
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour <= 18;
  const isCoast = (lng >= 79.6 && lat <= 13.5 && lat >= 10.0) || lng >= 80.1;
  const timeInfo = getFormattedLocalTime('Asia/Kolkata');

  const baseTemp = isDay ? 31 + Math.round(Math.sin(lat) * 4) : 26;
  const rainChance = isCoast ? 35 : 15;
  const windSpd = isCoast ? 22 : 12;

  return {
    locationName,
    lat,
    lng,
    temperature: baseTemp,
    temperatureC: `${baseTemp}°C`,
    feelsLike: baseTemp + 3,
    feelsLikeC: `${baseTemp + 3}°C`,
    rainPercentage: rainChance,
    rainPercentageText: `${rainChance}%`,
    precipitationMm: '0.0 mm/h',
    windSpeed: windSpd,
    windSpeedText: `${windSpd} km/h`,
    windDirection: isCoast ? 'ENE' : 'SE',
    windDirectionDeg: isCoast ? 70 : 135,
    humidity: isCoast ? 74 : 58,
    humidityText: isCoast ? '74%' : '58%',
    condition: isCoast ? 'Passing Clouds' : 'Partly Cloudy',
    conditionIcon: '⛅',
    conditionSeverity: 'normal',
    color: 'text-cyan-300',
    timeStr: timeInfo.timeStr,
    dateStr: timeInfo.dateStr,
    formattedTime: timeInfo.full,
    timezone: 'Asia/Kolkata',
    timestamp: new Date().toISOString(),
    isLive: false,
    source: 'Model Simulation',
  };
}

const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

/**
 * Fetches real-time weather from Open-Meteo API for given lat/lng
 * Includes high-performance in-memory caching to support instant auto-fetching
 * for every location viewed across the dashboard & map.
 */
export async function fetchRealtimeWeather(lat, lng, locationName = '') {
  if (lat == null || lng == null) {
    return generateFallbackWeather(13.0827, 80.2707, locationName || 'Location');
  }

  // Check cache (precision: 2 decimals = ~1km radius)
  const cacheKey = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    const updatedTime = getFormattedLocalTime(cached.data.timezone || 'Asia/Kolkata');
    return {
      ...cached.data,
      locationName: locationName || cached.data.locationName,
      timeStr: updatedTime.timeStr,
      dateStr: updatedTime.dateStr,
      formattedTime: updatedTime.full,
    };
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${Number(lat).toFixed(4)}&longitude=${Number(lng).toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability&timezone=auto`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn('Weather fetch failed, using fallback:', res.status);
      return generateFallbackWeather(lat, lng, locationName);
    }

    const data = await res.json();
    const curr = data.current || {};
    const tz = data.timezone || 'Asia/Kolkata';
    const timeInfo = getFormattedLocalTime(tz);

    const codeInfo = decodeWeatherCode(curr.weather_code);
    const cardinal = getWindCardinal(curr.wind_direction_10m);

    // Get rain probability for current hour
    const currentHourIndex = new Date().getHours();
    const hourlyProbs = data.hourly?.precipitation_probability || [];
    let rainProb = hourlyProbs[currentHourIndex];
    if (rainProb == null) {
      rainProb = curr.precipitation > 0 ? 80 : 10;
    }

    const temp = Math.round(curr.temperature_2m);
    const feels = Math.round(curr.apparent_temperature ?? temp);
    const wind = Math.round(curr.wind_speed_10m ?? 12);
    const humid = Math.round(curr.relative_humidity_2m ?? 50);
    const precip = (curr.precipitation ?? 0).toFixed(1);

    const weatherResult = {
      locationName,
      lat: Number(lat),
      lng: Number(lng),
      temperature: temp,
      temperatureC: `${temp}°C`,
      feelsLike: feels,
      feelsLikeC: `${feels}°C`,
      rainPercentage: rainProb,
      rainPercentageText: `${rainProb}%`,
      precipitationMm: `${precip} mm/h`,
      windSpeed: wind,
      windSpeedText: `${wind} km/h`,
      windDirection: cardinal,
      windDirectionDeg: curr.wind_direction_10m,
      humidity: humid,
      humidityText: `${humid}%`,
      condition: codeInfo.condition,
      conditionIcon: codeInfo.icon,
      conditionSeverity: codeInfo.severity,
      color: codeInfo.color,
      timeStr: timeInfo.timeStr,
      dateStr: timeInfo.dateStr,
      formattedTime: timeInfo.full,
      timezone: tz,
      timestamp: new Date().toISOString(),
      isLive: true,
      source: 'Open-Meteo High-Resolution Telemetry',
    };

    weatherCache.set(cacheKey, { data: weatherResult, timestamp: Date.now() });
    return weatherResult;
  } catch (err) {
    console.warn('Weather network error, using fallback:', err.message);
    return generateFallbackWeather(lat, lng, locationName);
  }
}
