/**
 * Real-Time Data Integration Service
 * Connects to live disaster monitoring APIs and data sources
 */

// ============================================================================
// API ENDPOINTS & CONFIGURATION
// ============================================================================

const API_CONFIG = {
  // India Meteorological Department (IMD)
  IMD_WEATHER: {
    baseUrl: 'https://api.weather.gov.in/v1',
    apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMD_API_KEY) || 'YOUR_IMD_API_KEY',
    endpoints: {
      currentWeather: '/current',
      forecast: '/forecast',
      warnings: '/warnings',
      rainfall: '/rainfall',
    },
  },

  // National Center for Seismology (NCS)
  SEISMOLOGY: {
    baseUrl: 'https://seismo.gov.in/api/v1',
    apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SEISMOLOGY_API_KEY) || 'YOUR_SEISMOLOGY_API_KEY',
    endpoints: {
      recentEarthquakes: '/earthquakes/recent',
      liveSeismic: '/live',
    },
  },

  // ISRO Satellite Data
  ISRO_SATELLITE: {
    baseUrl: 'https://bhuvan-app1.nrsc.gov.in/api',
    apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ISRO_API_KEY) || 'YOUR_ISRO_API_KEY',
    endpoints: {
      satelliteImagery: '/satellite/latest',
      cycloneTrack: '/cyclone/track',
    },
  },

  // Central Water Commission (CWC)
  WATER_COMMISSION: {
    baseUrl: 'https://ffs.tamingtheflood.in/api',
    endpoints: {
      riverLevels: '/river-levels',
      floodForecast: '/flood-forecast',
      damData: '/dam-data',
    },
  },

  // OpenWeatherMap (Backup/International)
  OPENWEATHER: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENWEATHER_API_KEY) || 'YOUR_OPENWEATHER_API_KEY',
    endpoints: {
      weather: '/weather',
      forecast: '/forecast',
      alerts: '/onecall',
    },
  },

  // USGS Earthquake API (Global seismic data)
  USGS_EARTHQUAKE: {
    baseUrl: 'https://earthquake.usgs.gov/fdsnws/event/1',
    endpoints: {
      query: '/query',
    },
  },
};

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch current weather data for a location
 */
export async function fetchWeatherData(lat, lng) {
  try {
    // Using OpenWeatherMap as example (replace with IMD in production)
    const response = await fetch(
      `${API_CONFIG.OPENWEATHER.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${API_CONFIG.OPENWEATHER.apiKey}&units=metric`
    );

    if (!response.ok) throw new Error('Weather API failed');

    const data = await response.json();

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      rainfall: data.rain?.['1h'] || 0,
      description: data.weather[0].description,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

/**
 * Fetch recent earthquake data
 */
export async function fetchEarthquakeData(lat, lng, radiusKm = 500) {
  try {
    const minMagnitude = 2.5;
    const maxRadiusDegrees = radiusKm / 111; // Convert km to degrees (approx)

    const url = `${API_CONFIG.USGS_EARTHQUAKE.baseUrl}/query?format=geojson&latitude=${lat}&longitude=${lng}&maxradiuskm=${radiusKm}&minmagnitude=${minMagnitude}&orderby=time&limit=10`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Earthquake API failed');

    const data = await response.json();

    return data.features.map(eq => ({
      magnitude: eq.properties.mag,
      location: eq.properties.place,
      depth: eq.geometry.coordinates[2],
      time: new Date(eq.properties.time).toISOString(),
      lat: eq.geometry.coordinates[1],
      lng: eq.geometry.coordinates[0],
      type: eq.properties.type,
    }));
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return [];
  }
}

/**
 * Fetch cyclone/storm tracking data
 */
export async function fetchCycloneData() {
  try {
    // In production, use ISRO/IMD cyclone tracking API
    // For now, using a placeholder structure
    const response = await fetch(
      `${API_CONFIG.OPENWEATHER.baseUrl}/onecall?lat=11.75&lon=79.77&appid=${API_CONFIG.OPENWEATHER.apiKey}&exclude=minutely,hourly`
    );

    if (!response.ok) throw new Error('Cyclone API failed');

    const data = await response.json();

    return {
      windSpeed: data.current.wind_speed * 3.6, // m/s to km/h
      windDirection: data.current.wind_deg,
      pressure: data.current.pressure,
      alerts: data.alerts || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching cyclone data:', error);
    return null;
  }
}

/**
 * Fetch river water level data
 */
export async function fetchRiverLevelData(riverId = 'cuddalore') {
  try {
    // In production, connect to Central Water Commission API
    // Placeholder structure for now

    // Simulated API call (replace with real CWC endpoint)
    const mockData = {
      riverId: riverId,
      currentLevel: 4.8 + (Math.random() * 0.5 - 0.25),
      dangerLevel: 6.0,
      warningLevel: 5.5,
      trend: 'rising',
      flowRate: 1250,
      timestamp: new Date().toISOString(),
    };

    return mockData;
  } catch (error) {
    console.error('Error fetching river level data:', error);
    return null;
  }
}

/**
 * Fetch rainfall data from multiple rain gauges
 */
export async function fetchRainfallData(areaCoords) {
  try {
    // In production, connect to IMD rainfall network
    const promises = areaCoords.map(coord =>
      fetch(
        `${API_CONFIG.OPENWEATHER.baseUrl}/weather?lat=${coord.lat}&lon=${coord.lng}&appid=${API_CONFIG.OPENWEATHER.apiKey}&units=metric`
      )
    );

    const responses = await Promise.all(promises);
    const data = await Promise.all(responses.map(r => r.json()));

    return data.map((d, i) => ({
      location: areaCoords[i].name,
      rainfall24h: d.rain?.['1h'] * 24 || 0, // Approximate 24h from 1h
      rainfall1h: d.rain?.['1h'] || 0,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    return [];
  }
}

// ============================================================================
// WEBSOCKET / REAL-TIME UPDATES
// ============================================================================

/**
 * WebSocket connection for real-time sensor data
 */
export class RealTimeDataStream {
  constructor(wsUrl = 'ws://your-websocket-server.com/stream') {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.notifyListeners(data.type, data.payload);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.reconnect();
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  notifyListeners(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// ============================================================================
// AGGREGATED DATA COLLECTION
// ============================================================================

/**
 * Fetch all data for a monitored area
 */
export async function fetchAreaData(area) {
  try {
    const [weather, earthquakes, cyclone, riverLevel, rainfall] = await Promise.all([
      fetchWeatherData(area.lat, area.lng),
      fetchEarthquakeData(area.lat, area.lng, 100),
      fetchCycloneData(),
      fetchRiverLevelData(area.name.toLowerCase()),
      fetchRainfallData([{ lat: area.lat, lng: area.lng, name: area.name }]),
    ]);

    return {
      areaId: area.id,
      areaName: area.name,
      weather,
      earthquakes,
      cyclone,
      riverLevel,
      rainfall: rainfall[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching data for ${area.name}:`, error);
    return null;
  }
}

/**
 * Fetch data for all monitored areas
 */
export async function fetchAllAreasData(areas) {
  const promises = areas.map(area => fetchAreaData(area));
  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

// ============================================================================
// AI RISK CALCULATION (Using Real Data)
// ============================================================================

/**
 * Calculate risk percentage based on real-time data
 */
export function calculateRiskScore(areaData) {
  let riskScore = 0;
  let maxScore = 100;

  // Rainfall risk (0-30 points)
  if (areaData.weather?.rainfall) {
    const rainfallRisk = Math.min((areaData.weather.rainfall / 200) * 30, 30);
    riskScore += rainfallRisk;
  }

  // Water level risk (0-25 points)
  if (areaData.riverLevel) {
    const levelRisk = Math.min((areaData.riverLevel.currentLevel / areaData.riverLevel.dangerLevel) * 25, 25);
    riskScore += levelRisk;
  }

  // Wind speed risk (0-20 points)
  if (areaData.weather?.windSpeed) {
    const windRisk = Math.min((areaData.weather.windSpeed / 100) * 20, 20);
    riskScore += windRisk;
  }

  // Earthquake risk (0-15 points)
  if (areaData.earthquakes?.length > 0) {
    const maxMag = Math.max(...areaData.earthquakes.map(eq => eq.magnitude));
    const eqRisk = Math.min((maxMag / 8) * 15, 15);
    riskScore += eqRisk;
  }

  // Pressure drop risk (0-10 points)
  if (areaData.weather?.pressure && areaData.weather.pressure < 1000) {
    const pressureRisk = Math.min(((1013 - areaData.weather.pressure) / 30) * 10, 10);
    riskScore += pressureRisk;
  }

  return {
    riskPercent: Math.min(Math.round(riskScore), 100),
    contributors: {
      rainfall: areaData.weather?.rainfall || 0,
      waterLevel: areaData.riverLevel?.currentLevel || 0,
      windSpeed: areaData.weather?.windSpeed || 0,
      earthquakeMagnitude: areaData.earthquakes?.[0]?.magnitude || 0,
      pressure: areaData.weather?.pressure || 1013,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// POLLING SERVICE (Alternative to WebSocket)
// ============================================================================

/**
 * Poll APIs at regular intervals for updates
 */
export class DataPollingService {
  constructor(areas, intervalMs = 30000) { // Default 30 seconds
    this.areas = areas;
    this.intervalMs = intervalMs;
    this.intervalId = null;
    this.onUpdate = null;
  }

  start(callback) {
    this.onUpdate = callback;

    // Initial fetch
    this.fetchAndNotify();

    // Set up polling
    this.intervalId = setInterval(() => {
      this.fetchAndNotify();
    }, this.intervalMs);

    console.log(`✅ Data polling started (${this.intervalMs / 1000}s interval)`);
  }

  async fetchAndNotify() {
    try {
      const data = await fetchAllAreasData(this.areas);

      // Calculate risk scores
      const dataWithRisk = data.map(areaData => ({
        ...areaData,
        risk: calculateRiskScore(areaData),
      }));

      if (this.onUpdate) {
        this.onUpdate(dataWithRisk);
      }
    } catch (error) {
      console.error('Error in polling cycle:', error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Data polling stopped');
    }
  }

  setInterval(ms) {
    this.intervalMs = ms;
    if (this.intervalId) {
      this.stop();
      this.start(this.onUpdate);
    }
  }
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  fetchWeatherData,
  fetchEarthquakeData,
  fetchCycloneData,
  fetchRiverLevelData,
  fetchRainfallData,
  fetchAreaData,
  fetchAllAreasData,
  calculateRiskScore,
  RealTimeDataStream,
  DataPollingService,
};
