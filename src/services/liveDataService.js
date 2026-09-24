// Live Data Service for Tamil Nadu Region
// Fetches real-time disaster data from actual APIs

const TAMIL_NADU_BOUNDS = {
  north: 19.5,  // Expanded north to cover AP and Karnataka
  south: 8.0,
  east: 84.5,   // Expanded east for AP coast
  west: 74.0,   // Expanded west for Karnataka
  center: { lat: 13.0827, lng: 80.2707 }, // Chennai
};

// Major cities in Tamil Nadu for monitoring
const TN_CITIES = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { name: 'Cuddalore', lat: 11.7480, lng: 79.7680 },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
];

// API endpoints
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

/**
 * Fetch live weather data for a Tamil Nadu city
 */
export async function fetchLiveWeather(cityName) {
  const city = TN_CITIES.find(c => c.name === cityName);
  if (!city) return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Weather API returned ${response.status} for ${cityName}`);
      return generateMockWeather(city);
    }

    const data = await response.json();

    return {
      city: cityName,
      lat: city.lat,
      lng: city.lng,
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      rainfall: data.rain?.['1h'] || 0,
      condition: data.weather[0]?.main || 'Clear',
      description: data.weather[0]?.description || 'clear sky',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error.message);
    return generateMockWeather(city);
  }
}

/**
 * Generate realistic mock weather for Tamil Nadu (fallback)
 */
function generateMockWeather(city) {
  const hour = new Date().getHours();
  const isRainySeason = [6, 7, 8, 9, 10, 11].includes(new Date().getMonth()); // Jun-Nov

  return {
    city: city.name,
    lat: city.lat,
    lng: city.lng,
    temp: Math.round(26 + Math.random() * 8 + (hour > 12 ? 2 : -2)), // 26-36°C
    humidity: Math.round(60 + Math.random() * 30), // 60-90%
    pressure: Math.round(1008 + Math.random() * 10), // 1008-1018 hPa
    windSpeed: Math.round(5 + Math.random() * 25), // 5-30 km/h
    rainfall: isRainySeason ? Math.random() * 5 : 0, // 0-5 mm
    condition: isRainySeason && Math.random() > 0.6 ? 'Rain' : 'Clear',
    description: isRainySeason && Math.random() > 0.6 ? 'light rain' : 'clear sky',
    timestamp: new Date().toISOString(),
    isMock: true,
  };
}

/**
 * Fetch live earthquake data for Tamil Nadu region (last 7 days)
 */
export async function fetchLiveEarthquakes() {
  try {
    const endtime = new Date().toISOString().split('T')[0];
    const starttime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const url = `${USGS_EARTHQUAKE_API}?format=geojson&starttime=${starttime}&endtime=${endtime}&minlatitude=${TAMIL_NADU_BOUNDS.south}&maxlatitude=${TAMIL_NADU_BOUNDS.north}&minlongitude=${TAMIL_NADU_BOUNDS.west}&maxlongitude=${TAMIL_NADU_BOUNDS.east}&minmagnitude=2.0`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`USGS API returned ${response.status}`);
      return generateMockEarthquakes();
    }

    const data = await response.json();

    const earthquakes = data.features.map(eq => ({
      id: eq.id,
      magnitude: eq.properties.mag,
      location: eq.properties.place || 'Tamil Nadu region',
      lat: eq.geometry.coordinates[1],
      lng: eq.geometry.coordinates[0],
      depth: eq.geometry.coordinates[2],
      timestamp: new Date(eq.properties.time).toISOString(),
      significance: eq.properties.sig,
    }));

    console.log(`✅ Fetched ${earthquakes.length} real earthquakes for Tamil Nadu`);
    return earthquakes;
  } catch (error) {
    console.error('Error fetching earthquakes:', error.message);
    return generateMockEarthquakes();
  }
}

/**
 * Generate mock earthquakes (fallback)
 */
function generateMockEarthquakes() {
  const count = Math.floor(Math.random() * 3); // 0-2 earthquakes
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-eq-${Date.now()}-${i}`,
    magnitude: 2.0 + Math.random() * 2.5, // 2.0-4.5
    location: TN_CITIES[Math.floor(Math.random() * TN_CITIES.length)].name,
    lat: TAMIL_NADU_BOUNDS.south + Math.random() * (TAMIL_NADU_BOUNDS.north - TAMIL_NADU_BOUNDS.south),
    lng: TAMIL_NADU_BOUNDS.west + Math.random() * (TAMIL_NADU_BOUNDS.east - TAMIL_NADU_BOUNDS.west),
    depth: 10 + Math.random() * 20,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    significance: Math.floor(Math.random() * 200),
    isMock: true,
  }));
}

/**
 * Calculate risk score based on live data
 */
export function calculateRiskFromLiveData(weather, earthquakes = []) {
  let riskScore = 0;

  // Weather risk factors
  if (weather.rainfall > 10) riskScore += 30; // Heavy rain
  else if (weather.rainfall > 5) riskScore += 15; // Moderate rain
  else if (weather.rainfall > 2) riskScore += 5; // Light rain

  if (weather.windSpeed > 60) riskScore += 25; // Cyclone-level winds
  else if (weather.windSpeed > 40) riskScore += 15; // Strong winds
  else if (weather.windSpeed > 25) riskScore += 5; // Moderate winds

  if (weather.humidity > 85) riskScore += 10; // High humidity

  // Earthquake risk
  const recentEarthquakes = earthquakes.filter(eq => {
    const ageHours = (Date.now() - new Date(eq.timestamp).getTime()) / (1000 * 60 * 60);
    return ageHours < 24; // Last 24 hours
  });

  recentEarthquakes.forEach(eq => {
    if (eq.magnitude >= 5.0) riskScore += 40;
    else if (eq.magnitude >= 4.0) riskScore += 20;
    else if (eq.magnitude >= 3.0) riskScore += 10;
    else riskScore += 5;
  });

  // Seasonal factors
  const month = new Date().getMonth();
  if ([9, 10, 11].includes(month)) riskScore += 10; // Cyclone season (Oct-Dec)

  return Math.min(100, Math.round(riskScore));
}

/**
 * Fetch all live data for Tamil Nadu
 */
export async function fetchAllLiveDataTN() {
  console.log('🌍 Fetching live data for Tamil Nadu...');

  try {
    // Fetch weather for all major cities
    const weatherPromises = TN_CITIES.map(city => fetchLiveWeather(city.name));
    const weatherData = await Promise.all(weatherPromises);

    // Fetch earthquakes
    const earthquakes = await fetchLiveEarthquakes();

    // Calculate risk for each city
    const citiesWithRisk = weatherData.map(weather => ({
      ...weather,
      riskPercent: calculateRiskFromLiveData(weather, earthquakes),
      earthquakesNearby: earthquakes.filter(eq => {
        const distance = calculateDistance(weather.lat, weather.lng, eq.lat, eq.lng);
        return distance < 100; // Within 100 km
      }).length,
    }));

    // Get highest risk areas
    const highRiskAreas = citiesWithRisk
      .filter(c => c.riskPercent >= 40)
      .sort((a, b) => b.riskPercent - a.riskPercent);

    const summary = {
      timestamp: new Date().toISOString(),
      cities: citiesWithRisk,
      earthquakes,
      highRiskAreas,
      overallRisk: Math.round(citiesWithRisk.reduce((sum, c) => sum + c.riskPercent, 0) / citiesWithRisk.length),
      alerts: highRiskAreas.map(area => ({
        id: `live-alert-${Date.now()}-${area.city}`,
        area: area.city,
        type: area.rainfall > 10 ? 'flood' : area.windSpeed > 60 ? 'cyclone' : 'weather',
        priority: area.riskPercent >= 75 ? 'P1' : area.riskPercent >= 50 ? 'P2' : 'P3',
        message: `${area.condition} in ${area.city}. Rain: ${area.rainfall.toFixed(1)}mm, Wind: ${area.windSpeed}km/h`,
        riskPercent: area.riskPercent,
        lat: area.lat,
        lng: area.lng,
        timestamp: area.timestamp,
        status: 'active',
      })),
    };

    console.log(`✅ Live data fetched: ${citiesWithRisk.length} cities, ${earthquakes.length} earthquakes, ${highRiskAreas.length} high-risk areas`);

    return summary;
  } catch (error) {
    console.error('❌ Error fetching live data:', error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Start live data polling (updates every 60 seconds)
 */
export class LiveDataPoller {
  constructor(callback, intervalSeconds = 60) {
    this.callback = callback;
    this.intervalSeconds = intervalSeconds;
    this.intervalId = null;
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      console.warn('⚠️ Live data poller already running');
      return;
    }

    console.log(`🚀 Starting live data poller (${this.intervalSeconds}s interval)`);
    this.isRunning = true;

    // Fetch immediately
    await this.fetch();

    // Then fetch at intervals
    this.intervalId = setInterval(() => this.fetch(), this.intervalSeconds * 1000);
  }

  async fetch() {
    try {
      const data = await fetchAllLiveDataTN();
      if (this.callback) {
        this.callback(data);
      }
    } catch (error) {
      console.error('❌ Error in live data poller:', error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('⏹️ Live data poller stopped');
    }
  }
}

export default {
  fetchLiveWeather,
  fetchLiveEarthquakes,
  fetchAllLiveDataTN,
  calculateRiskFromLiveData,
  LiveDataPoller,
  TN_CITIES,
  TAMIL_NADU_BOUNDS,
};
