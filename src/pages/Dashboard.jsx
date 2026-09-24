import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Users,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Activity,
  Droplets,
  Waves,
  Wind,
  Zap,
  Clock,
  Bell,
  AlertCircle,
  Info,
  Search,
  Navigation,
  Compass,
  Crosshair,
  Building2,
  Ambulance,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle2,
  Radio,
  Phone,
  Sparkles,
  HeartPulse,
  Home,
  Check,
  Send,
  ShieldAlert,
  Thermometer,
  CloudRain,
  FileText,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  monitoredAreas,
  hazardRiskOverview,
  changeTrendData,
  sensorData as initialSensorData,
  alerts,
  resqTeams,
} from '../data/mockData';
import { tnDamData } from '../data/damData';
import LiveDataDashboard from '../components/LiveDataDashboard';
import ResourceTracker from '../components/ResourceTracker';
import FutureRoadmapOperationsHub from '../components/Roadmap/FutureRoadmapOperationsHub';
import { useApp } from '../context/AppContext';
import {
  searchLocations,
  analyzeLocationRisk,
  calculateDistanceKm,
  calculateTransitEta,
  reverseGeocodeCoordinates,
  getFourDirectionalAdjacentZones,
} from '../services/locationService';
import { fetchRealtimeWeather } from '../services/weatherService';
import { fetchLiveEarthquakes } from '../services/liveDataService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const priorityConfig = {
  P1: { color: 'bg-red-500/20 text-red-400 border-red-500/40', bar: 'bg-gradient-to-r from-red-600 to-rose-500' },
  P2: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', bar: 'bg-gradient-to-r from-orange-600 to-amber-500' },
  P3: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', bar: 'bg-gradient-to-r from-amber-500 to-yellow-400' },
  P4: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', bar: 'bg-gradient-to-r from-blue-600 to-blue-400' },
};

const alertBorderColor = {
  critical: 'border-l-red-500 bg-red-500/5',
  warning: 'border-l-amber-500 bg-amber-500/5',
  info: 'border-l-cyan-500 bg-cyan-500/5',
};

const alertIconMap = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const alertTextColor = {
  critical: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-cyan-400',
};

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function sensorBarColor(pct) {
  if (pct >= 75) return 'bg-red-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-cyan-500';
}

// ── Custom Recharts Tooltips ─────────────────────────────────────────────────

function PieTooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 px-3.5 py-2 shadow-2xl text-xs backdrop-blur-md">
      <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: color }} />
      <span className="text-slate-200 font-semibold">{name}</span>
      <span className="ml-2 text-cyan-300 font-black">{value}%</span>
    </div>
  );
}

function AreaTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 px-3.5 py-2.5 shadow-2xl text-xs backdrop-blur-md">
      <p className="text-slate-400 mb-1 font-mono">{label}</p>
      <p className="text-white font-black text-sm">
        Composite Risk: <span className="text-red-400">{payload[0].value}%</span>
      </p>
    </div>
  );
}

function CustomPieLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ background: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// ── Dashboard Component ─────────────────────────────────────────────────────
// =============================================================================

function Dashboard() {
  const navigate = useNavigate();
  const {
    userLocation,
    isDetectingLocation,
    selectedSearchLocation,
    gpsPermissionStatus,
    isLiveTracking,
    setIsLiveTracking,
    gpsTrackerTelemetry,
    simulateGpsMovement,
    detectUserLocation,
    setSearchLocation,
    setUserExactLocation,
    disasters,
    teams,
    hospitals,
    rawHospitals,
    alerts: contextAlerts,
    monitoredAreas: contextAreas,
    getStats,
    showNotification,
    autoDeployTeam,
    removeDisaster,
  } = useApp();

  const stats = getStats();

  // Calculate risk trend dynamically
  const calculateRiskTrend = () => {
    if (changeTrendData.length < 2) return { status: 'stable', label: 'STABLE', color: 'blue', icon: ArrowRight };

    const lastThree = changeTrendData.slice(-3);
    const avgChange = (lastThree[lastThree.length - 1].risk - lastThree[0].risk) / lastThree.length;

    if (avgChange > 5) return {
      status: 'elevated',
      label: 'ELEVATED TREND',
      color: 'red',
      icon: ArrowUpRight,
      bgClass: 'bg-red-500/10 border-red-500/30',
      textClass: 'text-red-400'
    };
    if (avgChange < -5) return {
      status: 'declining',
      label: 'DECLINING',
      color: 'green',
      icon: ArrowDown,
      bgClass: 'bg-green-500/10 border-green-500/30',
      textClass: 'text-green-400'
    };
    return {
      status: 'stable',
      label: 'STABLE',
      color: 'blue',
      icon: ArrowRight,
      bgClass: 'bg-blue-500/10 border-blue-500/30',
      textClass: 'text-blue-400'
    };
  };

  const riskTrend = calculateRiskTrend();

  // ── Live Digital Clock (IST & UTC) ────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Real-time Sensor Data Sync ──────────────────────────────────────────
  const [sensors, setSensors] = useState({
    rainfall: { ...initialSensorData.rainfall, value: 0 },
    waterLevel: { ...initialSensorData.waterLevel, value: 1.5 },
    windSpeed: { ...initialSensorData.windSpeed },
    seismic: {
      value: 0.0,
      unit: initialSensorData.seismicActivity.unit,
      trend: 'stable',
      threshold: initialSensorData.seismicActivity.threshold,
    },
  });



  // ── Manual Location Search & Full Dossier State ───────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [analyzedLocation, setAnalyzedLocation] = useState(null);
  const [dossierTab, setDossierTab] = useState('vulnerability'); // 'vulnerability' | 'medical' | 'shelters' | 'tactical' | 'weather'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const searchContainerRef = useRef(null);

  // Manual Exact Location Setter
  const [isManualSetterOpen, setIsManualSetterOpen] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [manualSuggestions, setManualSuggestions] = useState([]);
  const [isSearchingManual, setIsSearchingManual] = useState(false);

  useEffect(() => {
    if (!manualLocationInput || manualLocationInput.trim().length < 2) {
      setManualSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearchingManual(true);
      const res = await searchLocations(manualLocationInput);
      setManualSuggestions(res);
      setIsSearchingManual(false);
    }, 350);
    return () => clearTimeout(t);
  }, [manualLocationInput]);

  const handleConfirmExactLocation = (loc) => {
    setUserExactLocation({
      ...loc,
      isDetected: true,
      isRealGps: true,
      isApproximateNetwork: false,
      accuracy: loc.accuracy || 5,
    });
    setIsManualSetterOpen(false);
    setManualLocationInput('');
    setManualSuggestions([]);
    showNotification({
      id: Date.now(),
      type: 'system',
      title: '🎯 EXACT SECTOR LOCKED',
      message: `Command origin recalibrated to ${loc.name}. Dynamic hospital distances and transit ETAs updated.`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  // ── Live Progressive Hardware GPS Satellite Scanner ────────────────────────
  const [isScanningGps, setIsScanningGps] = useState(false);

  const handleForceHardwareGpsScan = () => {
    if (!navigator.geolocation) {
      showNotification({
        id: Date.now(),
        type: 'alert',
        title: 'NO GPS SENSOR DETECTED',
        message: 'Browser geolocation API is not supported on this device. Please calibrate your area below.',
        severity: 'warning',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setIsScanningGps(true);
    let watchId = null;
    let timer = null;

    const cleanup = () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (timer !== null) clearTimeout(timer);
      setIsScanningGps(false);
    };

    // Watch position with highest accuracy and zero cache
    watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        // If fine GPS acquired (< 1000m)
        if (accuracy < 1000) {
          cleanup();
          const loc = await reverseGeocodeCoordinates(latitude, longitude, accuracy);
          setUserExactLocation({
            ...loc,
            isRealGps: true,
            isApproximateNetwork: false,
          });
          showNotification({
            id: Date.now(),
            type: 'system',
            title: '🎯 EXACT SATELLITE GPS LOCKED',
            message: `Exact coordinates locked: ${loc.name} (Accuracy: ±${Math.round(accuracy)}m)`,
            severity: 'info',
            timestamp: new Date().toISOString(),
          });
        }
      },
      (err) => {
        console.warn('GPS watch error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    // Timeout after 12 seconds
    timer = setTimeout(async () => {
      cleanup();
      try {
        await detectUserLocation();
      } catch (_e) {
        // Fallback silently
      }
    }, 12000);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search via Nominatim
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setSearchDropdownOpen(results.length > 0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Full-fledged location analysis logic
  const handleSelectLocation = (loc) => {
    setSearchQuery(loc.name);
    setSearchDropdownOpen(false);
    setIsAnalyzing(true);

    const analysis = analyzeLocationRisk(
      loc.lat,
      loc.lng,
      loc.name,
      disasters,
      contextAreas || monitoredAreas,
      rawHospitals || hospitals,
      loc
    );

    setAnalyzedLocation({
      ...loc,
      ...analysis,
    });
    setDossierTab('vulnerability');
    setSearchLocation(loc);
    setIsAnalyzing(false);

    // Asynchronously fetch live real-time weather (time, temperature, rain %, wind speed)
    fetchRealtimeWeather(loc.lat, loc.lng, loc.name).then((liveWeather) => {
      setAnalyzedLocation((prev) => (prev ? { ...prev, weather: liveWeather } : prev));
    });
  };

  const handleQuickChipSearch = async (cityName) => {
    setSearchQuery(cityName);
    setIsSearching(true);
    try {
      const results = await searchLocations(cityName);
      if (results && results.length > 0) {
        handleSelectLocation(results[0]);
      }
    } catch (e) {
      console.error('Quick chip search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSetAsPrimaryOrigin = (loc) => {
    setSearchLocation(loc);
    showNotification({
      id: Date.now(),
      type: 'system',
      title: '📍 COMMAND ORIGIN UPDATED',
      message: `System origin recalibrated to ${loc.name}. Hospital distances dynamically recomputed.`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  const handleClearAnalysis = () => {
    setAnalyzedLocation(null);
    setSearchQuery('');
    setSearchLocation(null);
  };

  const handleQuickDeployToSector = (locationData) => {
    const available = teams.find((t) => t.status === 'standby');
    if (!available) {
      showNotification({
        id: Date.now(),
        type: 'alert',
        title: 'NO STANDBY SQUADS',
        message: 'All 5 rescue units are currently deployed. Consider recalling an active unit.',
        severity: 'warning',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    autoDeployTeam({
      areaName: locationData.locationName,
      type: 'Sector Emergency Defense',
      severity: locationData.calculatedRisk >= 70 ? 'critical' : 'high',
      lat: locationData.lat,
      lng: locationData.lng,
    });
    showNotification({
      id: Date.now(),
      type: 'system',
      title: '🚨 RESCUE SQUAD DISPATCHED',
      message: `${available.name} dispatched to ${locationData.locationName} for emergency defense.`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  // ── Derived counts from live global state ──────────────────────────────────
  const ongoingDisasters = disasters.filter((d) => d.status !== 'completed');
  const activeHazards =
    ongoingDisasters.length > 0 ? ongoingDisasters.length : hazardRiskOverview.filter((h) => h.value > 10).length;
  const criticalHazards = ongoingDisasters.filter((d) => d.severity === 'critical').length;
  const areasCount = (contextAreas && contextAreas.length) || monitoredAreas.length;
  const deployedTeams = teams.filter((t) => t.status === 'deployed').length;
  const currentRiskPercent = stats.overallRiskPercent || 76;

  // Active origin is either searched location or user's GPS
  const activeOrigin = selectedSearchLocation || userLocation;
  const nearestHospital = hospitals[0] || null;

  // ── Auto-Fetch Live Weather for Currently Viewed Operational Origin ────────
  const [activeOriginWeather, setActiveOriginWeather] = useState(null);
  const [isLoadingActiveWeather, setIsLoadingActiveWeather] = useState(false);
  const [liveEarthquakeMag, setLiveEarthquakeMag] = useState(0.0);

  const activeWeatherRef = useRef(activeOriginWeather);
  const earthquakeMagRef = useRef(liveEarthquakeMag);
  
  useEffect(() => {
    activeWeatherRef.current = activeOriginWeather;
  }, [activeOriginWeather]);

  useEffect(() => {
    earthquakeMagRef.current = liveEarthquakeMag;
  }, [liveEarthquakeMag]);

  useEffect(() => {
    fetchLiveEarthquakes().then(eqs => {
      if (eqs && eqs.length > 0) {
        const maxMag = Math.max(...eqs.map(e => e.magnitude));
        setLiveEarthquakeMag(maxMag);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) => {
        const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
        const liveWeather = activeWeatherRef.current;
        
        // 1. Real Rainfall from OpenMeteo
        let realRain = 0;
        if (liveWeather && liveWeather.precipitationMm) {
          realRain = parseFloat(liveWeather.precipitationMm);
          if (isNaN(realRain)) realRain = 0;
        }

        // 2. Real Wind Speed from OpenMeteo
        let realWind = prev.windSpeed.value;
        if (liveWeather && liveWeather.windSpeed != null) {
          realWind = liveWeather.windSpeed;
        }

        // 3. Simulated Water Level logic (depends on REAL rain)
        let nextWater = prev.waterLevel.value;
        let waterTrend = 'stable';
        
        if (realRain === 0) {
          // No rain: water recedes slowly to baseline 1.5m
          if (nextWater > 1.5) {
            nextWater -= 0.02;
            waterTrend = 'falling';
          }
        } else if (realRain > 5) {
          // Heavy rain: water rises
          nextWater += 0.05;
          waterTrend = 'rising';
        } else {
          // Light rain: steady
          waterTrend = 'stable';
        }

        return {
          rainfall: {
            ...prev.rainfall,
            value: realRain,
            trend: realRain > 0 ? 'rising' : 'stable',
          },
          waterLevel: {
            ...prev.waterLevel,
            value: clamp(Math.round(nextWater * 100) / 100, 1.0, 7.0),
            trend: waterTrend,
          },
          windSpeed: {
            ...prev.windSpeed,
            value: realWind,
            trend: 'stable',
          },
          seismic: {
            ...prev.seismic,
            value: clamp(Math.round(earthquakeMagRef.current * 10) / 10, 0.0, 9.9),
            trend: earthquakeMagRef.current > 3.0 ? 'rising' : 'stable',
          },
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeOrigin?.lat || !activeOrigin?.lng) return;
    let active = true;
    setIsLoadingActiveWeather(true);

    fetchRealtimeWeather(
      activeOrigin.lat,
      activeOrigin.lng,
      activeOrigin.specificArea || activeOrigin.name || 'Current Operational Origin'
    ).then((w) => {
      if (active && w) {
        setActiveOriginWeather(w);
        setIsLoadingActiveWeather(false);
      }
    }).catch(() => {
      if (active) setIsLoadingActiveWeather(false);
    });

    return () => {
      active = false;
    };
  }, [activeOrigin?.lat, activeOrigin?.lng, activeOrigin?.name, activeOrigin?.specificArea]);

  // ── 4-Directional Adjacent Zones (North, South, East, West) ─────────────
  const adjacentZones = useMemo(() => {
    return getFourDirectionalAdjacentZones(
      activeOrigin.lat,
      activeOrigin.lng,
      activeOrigin.specificArea || activeOrigin.name
    );
  }, [activeOrigin.lat, activeOrigin.lng, activeOrigin.name, activeOrigin.specificArea]);

  const handleFocusAdjacentZone = (zone) => {
    const locObj = {
      id: `dir-${zone.direction.toLowerCase()}-${Date.now()}`,
      name: zone.name,
      specificArea: zone.name,
      city: zone.locality || zone.name,
      district: zone.zoneCode,
      lat: zone.lat,
      lng: zone.lng,
      zone: {
        code: zone.zoneCode,
        name: zone.hazard,
        alertLevel: zone.alertLevel,
        evacuationRoute: zone.evacuationRoute,
      },
    };
    handleSelectLocation(locObj);
    showNotification({
      id: Date.now(),
      type: 'system',
      title: `🧭 FOCUSED ${zone.direction} SECTOR`,
      message: `Pivoted tactical radar to ${zone.name} (${zone.distanceKm} km).`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  // ── Top 4 Stat Cards (Bed metrics removed, proximity highlighted) ───────────
  const statCards = [
    {
      label: 'Overall Threat Index',
      value: `${currentRiskPercent}%`,
      icon: ShieldAlert,
      gradient: 'from-rose-500 via-red-500 to-rose-700',
      glow: 'glow-red',
      iconBg: 'bg-red-500/20 text-red-400 border border-red-500/40',
      subtext: currentRiskPercent >= 75 ? 'DEFCON 2: CRITICAL RISK' : 'DEFCON 3: ELEVATED ALERT',
      trend: ongoingDisasters.length > 0 ? `${ongoingDisasters.length} active emergency` : 'Multi-sensor baseline',
      trendUp: true,
    },
    {
      label: 'Active Incident Hazards',
      value: activeHazards,
      icon: AlertTriangle,
      gradient: 'from-amber-500 via-orange-500 to-amber-700',
      glow: 'glow-amber',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      subtext: `${criticalHazards} Critical Priority Zones`,
      trend: ongoingDisasters.length > 0 ? '+ Live Sensor Alarms' : 'Automated Patrol Active',
      trendUp: ongoingDisasters.length > 0,
    },
    {
      label: 'Field Rescue Units',
      value: `${deployedTeams} / ${teams.length}`,
      icon: Users,
      gradient: 'from-purple-500 via-violet-600 to-indigo-700',
      glow: 'glow-purple',
      iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
      subtext: `${stats.availableTeams || 0} squads on standby`,
      trend: deployedTeams > 0 ? `${deployedTeams} mission(s) running` : 'All units standby',
      trendUp: deployedTeams > 0,
    },
    {
      label: 'Closest Trauma Facility',
      value: nearestHospital ? `${nearestHospital.distance} km` : '2.5 km',
      icon: Building2,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      glow: 'glow-emerald',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      subtext: nearestHospital ? nearestHospital.name : 'Cuddalore GH',
      trend: `ETA: ${nearestHospital ? nearestHospital.transitEta : '6 mins'} • ${nearestHospital ? nearestHospital.ambulances : 4} Ambulances`,
      trendUp: false,
    },
  ];

  // ── Sensor display config ──────────────────────────────────────────────────
  const sensorDisplays = [
    {
      key: 'rainfall',
      label: 'Rainfall Intensity',
      icon: Droplets,
      iconColor: 'text-cyan-400',
      data: sensors.rainfall,
      glow: 'border-cyan-500/30 shadow-cyan-500/10',
    },
    {
      key: 'waterLevel',
      label: 'River / Surge Crest',
      icon: Waves,
      iconColor: 'text-blue-400',
      data: sensors.waterLevel,
      glow: 'border-blue-500/30 shadow-blue-500/10',
    },
    {
      key: 'windSpeed',
      label: 'Gale Wind Velocity',
      icon: Wind,
      iconColor: 'text-teal-400',
      data: sensors.windSpeed,
      glow: 'border-teal-500/30 shadow-teal-500/10',
    },
    {
      key: 'seismic',
      label: 'Seismic Richter Scale',
      icon: Zap,
      iconColor: 'text-amber-400',
      data: sensors.seismic,
      glow: 'border-amber-500/30 shadow-amber-500/10',
    },
  ];

  // ── Recent alerts ──────────────────────────────────────────────────────────
  const recentAlerts = [...(contextAlerts && contextAlerts.length > 0 ? contextAlerts : alerts)]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

  // ── Areas sorted by risk descending ────────────────────────────────────────
  const sortedAreas = [...(contextAreas && contextAreas.length > 0 ? contextAreas : monitoredAreas)]
    .sort((a, b) => b.riskPercent - a.riskPercent);

  // ── Quick chips for Tamil Nadu & Indian Cities ─────────────────────────────
  const quickCities = ['Chennai', 'Cuddalore', 'Madurai', 'Coimbatore', 'Villupuram', 'Salem', 'Trichy'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <h1 className="text-lg font-bold text-white">
              Emergency Operations Command Center
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
            Live Stream Online
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/dams"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
            title="Open Live 1-Minute Reservoir Telemetry & Flood Early Warning"
          >
            <Droplets className="h-4 w-4" />
            <span>1-Min Dam Telemetry</span>
          </Link>

          <Link
            to="/reports"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-colors shadow-sm"
            title="Open Certified EOC Reports & InsurTech Claim Dossiers"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>EOC & InsurTech Audits</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>

          <Link
            to="/map"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-md"
          >
            <Compass className="h-4 w-4" />
            <span>View Map</span>
          </Link>
        </div>
      </div>

      {/* Enterprise Commercial Protection & Hydrology Operations Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/40 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Enterprise Operations · Commercial Protection Active
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                1-Min Live CWC Dam Feed
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Commercial B2G & InsurTech Engine: ₹482.6 Cr assets protected · 1-minute live SCADA reservoir hydrology · Certified 48h parametric insurance claim dossiers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <Link
            to="/dams"
            className="w-full md:w-auto text-center px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            Open 1-Min Dam Telemetry →
          </Link>
        </div>
      </div>

      {/* Search & Location Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Operational Autonomous GPS Live Tracker HUD */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                  Autonomous GPS Live Tracker
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLiveTracking(!isLiveTracking)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider transition-all ${
                    isLiveTracking
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Toggle continuous autonomous GPS tracking stream"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLiveTracking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  {isLiveTracking ? 'TRACKER ACTIVE (ZERO-CACHE)' : 'TRACKER PAUSED'}
                </button>
              </div>
            </div>

            {/* Current Active Origin Card with Granular Details & Dynamic Hazard Zone */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="font-extrabold text-white truncate text-sm sm:text-base tracking-wide">
                      {activeOrigin.specificArea || activeOrigin.name || 'Detecting GPS Coordinates...'}
                    </span>
                  </div>

                  {/* Subtitle with granular district / state */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300">
                    {activeOrigin.specificArea && (
                      <span className="font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-mono text-[11px]">
                        📍 {activeOrigin.specificArea}
                      </span>
                    )}
                    {activeOrigin.city && (
                      <span className="text-slate-300">City: <strong className="text-white">{activeOrigin.city}</strong></span>
                    )}
                    {activeOrigin.district && (
                      <span className="text-slate-400">Dist: {activeOrigin.district}</span>
                    )}
                    {activeOrigin.state && (
                      <span className="text-slate-400">({activeOrigin.state})</span>
                    )}
                  </div>

                  {/* Dynamic Hazard Zone Banner */}
                  {activeOrigin.zone && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            activeOrigin.zone.alertLevel === 'CRITICAL' || activeOrigin.zone.code?.includes('IV')
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : activeOrigin.zone.code?.includes('III')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}>
                            {activeOrigin.zone.code}: {activeOrigin.zone.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {activeOrigin.zone.alertLevel} RISK
                          </span>
                        </div>
                        {activeOrigin.zone.evacuationRoute && (
                          <p className="text-[10px] text-slate-400 mt-1 truncate">
                            Primary Evacuation: <span className="text-slate-300 font-medium">{activeOrigin.zone.evacuationRoute}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Live Sensor Telemetry Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-[11px] font-mono">
                    <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                      <span className="text-[9px] text-slate-500 block uppercase">Lat/Lng</span>
                      <span className="text-slate-200 font-semibold">{activeOrigin.lat?.toFixed(4)}, {activeOrigin.lng?.toFixed(4)}</span>
                    </div>
                    <div className="bg-slate-950/60 p-1.5 rounded border border-slate-855">
                      <span className="text-[9px] text-slate-500 block uppercase">Accuracy</span>
                      <span className="text-emerald-400 font-semibold">±{activeOrigin.accuracy || 8}m</span>
                    </div>
                    <div className="bg-slate-950/60 p-1.5 rounded border border-slate-855">
                      <span className="text-[9px] text-slate-500 block uppercase">Motion</span>
                      <span className={`font-semibold ${gpsTrackerTelemetry?.movementState === 'IN MOTION' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`}>
                        {gpsTrackerTelemetry?.movementState || 'STATIONARY'}
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-1.5 rounded border border-slate-855">
                      <span className="text-[9px] text-slate-500 block uppercase">Speed</span>
                      <span className="text-slate-300 font-semibold">
                        {gpsTrackerTelemetry?.speed ? (gpsTrackerTelemetry.speed * 3.6).toFixed(1) : '0.0'} km/h
                      </span>
                    </div>
                  </div>

                  {/* Auto-Fetched Live Meteorological Telemetry for Viewed Origin */}
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 border border-cyan-500/30">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl select-none">
                          {activeOriginWeather?.conditionIcon || '⛅'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {activeOriginWeather?.condition || (isLoadingActiveWeather ? 'Fetching atmosphere...' : 'Clear Sky')}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              AUTO WEATHER
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {activeOriginWeather?.feelsLikeC ? `Feels ${activeOriginWeather.feelsLikeC}` : 'Satellite sync active'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="flex items-center gap-1 text-cyan-400 justify-end text-xs font-bold">
                          <Clock className="h-3 w-3" />
                          <span>{activeOriginWeather?.timeStr || currentTime.toLocaleTimeString()}</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{activeOriginWeather?.dateStr || 'Today'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                          <Thermometer className="h-2.5 w-2.5 text-amber-400" /> Temp
                        </span>
                        <span className="text-amber-300 font-black text-xs">
                          {activeOriginWeather?.temperatureC || '--°C'}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                          <CloudRain className="h-2.5 w-2.5 text-blue-400" /> Rain %
                        </span>
                        <span className="text-blue-400 font-black text-xs">
                          {activeOriginWeather?.rainPercentageText || '--%'}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                          <Wind className="h-2.5 w-2.5 text-cyan-400" /> Wind
                        </span>
                        <span className="text-cyan-300 font-black text-xs">
                          {activeOriginWeather?.windSpeedText || '-- km/h'}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                          <Droplets className="h-2.5 w-2.5 text-teal-400" /> Humid
                        </span>
                        <span className="text-teal-300 font-black text-xs">
                          {activeOriginWeather?.humidityText || '--%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedSearchLocation && (
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800">
                      <span className="text-[11px] text-cyan-400 font-medium">
                        🔍 Analyzing Custom Searched Location
                      </span>
                      <button
                        onClick={() => {
                          setSearchLocation(null);
                          setAnalyzedLocation(null);
                        }}
                        className="text-[11px] text-slate-300 hover:text-white underline font-semibold"
                      >
                        Reset to Live GPS Tracker
                      </button>
                    </div>
                  )}
                </div>

                {/* Detect / Satellite Lock Action Buttons */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => detectUserLocation()}
                    disabled={isDetectingLocation || isScanningGps}
                    title="Force refresh live GPS coordinates from sensor"
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`}
                    />
                    <span>{isDetectingLocation ? 'Locating...' : 'Refresh GPS'}</span>
                  </button>

                  <button
                    onClick={handleForceHardwareGpsScan}
                    disabled={isScanningGps || isDetectingLocation}
                    title="Fine satellite radar scan"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Radio className={`h-3 w-3 text-cyan-400 ${isScanningGps ? 'animate-pulse' : ''}`} />
                    <span>{isScanningGps ? 'Locking...' : 'Satellite Lock'}</span>
                  </button>
                </div>
              </div>

              {/* GPS Live Location Permission & Sensor Status */}
              {!userLocation.isDetected || gpsPermissionStatus !== 'granted' ? (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/50 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Navigation className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          Live Hardware GPS Permission Required
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          Click below to request GPS location tracking. When your browser prompts for permission, click <strong className="text-cyan-300">&quot;Allow&quot;</strong> to stream your live coordinates.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => detectUserLocation()}
                    disabled={isDetectingLocation}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <Crosshair className={`h-4 w-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                    <span>{isDetectingLocation ? 'Requesting Permission from Browser...' : 'Grant GPS Live Location Permission'}</span>
                  </button>

                  {gpsPermissionStatus === 'denied' && (
                    <div className="p-2 rounded bg-red-500/20 border border-red-500/40 text-[11px] text-red-300 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        Permission is blocked. Click the lock/settings icon in your browser address bar next to <code>localhost:3000</code> and switch Location to <strong>Allow</strong>.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 font-semibold text-[11px]">
                      GPS Permission Granted • Hardware Sensors Streaming
                    </span>
                  </div>
                  <button
                    onClick={() => detectUserLocation()}
                    disabled={isDetectingLocation}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold underline"
                  >
                    {isDetectingLocation ? 'Refreshing...' : 'Re-sync GPS'}
                  </button>
                </div>
              )}
            </div>

            {/* Always-Accessible Exact Location Search Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
                  Type Your Exact Neighborhood / Town
                </span>
                <span className="text-[10px] text-slate-400">1-CLICK LOCK</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={manualLocationInput}
                  onChange={(e) => setManualLocationInput(e.target.value)}
                  placeholder="Type exact area name (e.g. Tambaram, Vandalur, Kelambakkam, Anna Nagar)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                />
                {isSearchingManual && (
                  <RefreshCw className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-cyan-400 animate-spin" />
                )}
              </div>
              {manualSuggestions.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-lg bg-slate-950 border border-slate-700 divide-y divide-slate-800 animate-fade-in">
                  {manualSuggestions.map((sug) => (
                    <button
                      key={sug.id}
                      onClick={() => handleConfirmExactLocation(sug)}
                      className="w-full p-2.5 text-left hover:bg-slate-850 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{sug.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{sug.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                        Lock as My Location
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Type-to-Search Manual Location Analysis Bar */}
          <div className="lg:col-span-7 space-y-3.5" ref={searchContainerRef}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-cyan-400 shrink-0" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-white">
                  Location Intelligence &amp; Risk Search
                </h2>
              </div>
              {analyzedLocation && (
                <button
                  onClick={handleClearAnalysis}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-semibold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg"
                >
                  <X className="h-4 w-4" />
                  Clear Search
                </button>
              )}
            </div>

            {/* Input with Auto-complete Dropdown */}
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setSearchDropdownOpen(true);
                  }}
                  placeholder="Search any town, neighborhood, city or district (e.g. Cuddalore, Madurai, Velachery)..."
                  className="w-full rounded-xl bg-slate-950/90 border-2 border-slate-700 pl-14 pr-12 py-3.5 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all shadow-inner"
                />
                <Search className="absolute left-4.5 h-5 w-5 text-cyan-400 pointer-events-none" />
                {isSearching && (
                  <RefreshCw className="absolute right-4 h-5 w-5 text-cyan-400 animate-spin" />
                )}
                {!isSearching && searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-4 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {searchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl bg-slate-900 border border-slate-700/90 shadow-2xl overflow-hidden divide-y divide-slate-800 animate-fade-in max-h-72 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectLocation(item)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-800 flex items-center justify-between gap-3 transition-colors group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div className="truncate">
                          <p className="text-sm font-bold text-white group-hover:text-cyan-300">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Full Dossier →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Location Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-bold font-mono mr-1">Quick Select:</span>
              {quickCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleQuickChipSearch(city)}
                  className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-semibold transition-all hover:border-cyan-500/50"
                >
                  {city}
                </button>
              ))}
            </div>

            {/* ── 4-DIRECTIONAL ADJACENT ZONES HUD (PERIMETER RADAR) ─────────── */}
            <div className="mt-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 sm:p-4 space-y-3 shadow-inner">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                      Nearby Perimeter Zones • 4 Cardinal Vectors
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Calculated from: <strong className="text-cyan-300">{activeOrigin.specificArea || activeOrigin.name || 'Current Sector'}</strong>{' '}
                      <span className="font-mono text-slate-500">({activeOrigin.lat?.toFixed(4)}, {activeOrigin.lng?.toFixed(4)})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                    selectedSearchLocation
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {selectedSearchLocation ? '🔍 Manual Target' : '🛰️ Live GPS Origin'}
                  </span>
                  {selectedSearchLocation && (
                    <button
                      onClick={() => {
                        setSearchLocation(null);
                        setAnalyzedLocation(null);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors cursor-pointer"
                      title="Return perimeter radar to your live GPS coordinates"
                    >
                      Reset to GPS
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Cards Grid (North, South, East, West) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: 'north',
                    data: adjacentZones.north,
                    icon: ArrowUp,
                    cardinalBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                    borderHover: 'hover:border-cyan-400/60',
                    bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20',
                  },
                  {
                    key: 'south',
                    data: adjacentZones.south,
                    icon: ArrowDown,
                    cardinalBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                    borderHover: 'hover:border-indigo-400/60',
                    bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20',
                  },
                  {
                    key: 'east',
                    data: adjacentZones.east,
                    icon: ArrowRight,
                    cardinalBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                    borderHover: 'hover:border-teal-400/60',
                    bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/20',
                  },
                  {
                    key: 'west',
                    data: adjacentZones.west,
                    icon: ArrowLeft,
                    cardinalBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                    borderHover: 'hover:border-purple-400/60',
                    bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20',
                  },
                ].map(({ key, data, icon: DirectionIcon, cardinalBadge, borderHover, bgGradient }) => (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border border-slate-800 ${bgGradient} ${borderHover} transition-all duration-200 flex flex-col justify-between group shadow-sm`}
                  >
                    <div className="space-y-1.5">
                      {/* Top cardinal heading and metric */}
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded border ${cardinalBadge} font-mono tracking-wider`}>
                          <DirectionIcon className="h-3 w-3" />
                          {data.direction} ({data.cardinal})
                        </span>
                        <span className="font-mono text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {data.bearingText} • <strong className="text-white">{data.distanceKm} km</strong> ({data.transitEta})
                        </span>
                      </div>

                      {/* Zone Name */}
                      <p className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate mt-0.5">
                        {data.name}
                      </p>

                      {/* Threat Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                          data.riskPercent >= 70
                            ? 'bg-red-500/25 text-red-300 border-red-500/40'
                            : data.riskPercent >= 50
                              ? 'bg-orange-500/25 text-orange-300 border-orange-500/40'
                              : data.riskPercent > 0
                                ? 'bg-yellow-500/25 text-yellow-300 border-yellow-500/40'
                                : 'bg-blue-500/25 text-blue-300 border-blue-500/40'
                        }`}>
                          {data.zoneCode} • {data.riskPercent}% {data.alertLevel}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {data.hazard}
                        </span>
                      </div>

                      {/* Primary Evacuation Corridor */}
                      {data.evacuationRoute && (
                        <p className="text-[10px] text-slate-400 truncate mt-1">
                          Evac: <span className="text-slate-300 font-medium">{data.evacuationRoute}</span>
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500">
                        {data.lat.toFixed(3)}, {data.lng.toFixed(3)}
                      </span>
                      <button
                        onClick={() => handleFocusAdjacentZone(data)}
                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                        title={`Analyze ${data.name} dossier and calculate distances`}
                      >
                        <span>Focus Sector</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom live tracker note */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Automatic 4-axis perimeter calculation active • zero-cache
                </span>
                <span className="text-slate-500 hidden sm:inline">
                  Click any sector to lock &amp; expand full intelligence
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── FULL-FLEDGED LOCATION INTELLIGENCE DOSSIER ─────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {analyzedLocation && (
          <div className="mt-6 pt-6 border-t border-slate-700/80 animate-fade-in">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-cyan-500/50 shadow-2xl overflow-hidden glow-cyan">
              
              {/* Dossier Header */}
              <div className="p-5 sm:p-6 bg-slate-900/95 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                        {analyzedLocation.locationName}
                      </h3>
                      <span
                        className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                          analyzedLocation.calculatedRisk >= 70
                            ? 'bg-red-500/25 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20'
                            : analyzedLocation.calculatedRisk >= 50
                              ? 'bg-orange-500/25 text-orange-300 border border-orange-500/40'
                              : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {analyzedLocation.alertLevel} THREAT ({analyzedLocation.calculatedRisk}%)
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {analyzedLocation.vulnerabilityZone}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 font-mono">
                      <span>📍 Coordinates: {analyzedLocation.lat}° N, {analyzedLocation.lng}° E</span>
                      <span>•</span>
                      <span>🗺️ Terrain: <strong className="text-slate-200 font-sans">{analyzedLocation.terrainType}</strong></span>
                      <span>•</span>
                      <span>👥 Est. Population: <strong className="text-slate-200 font-sans">~{analyzedLocation.populationEstimate} residents</strong></span>
                    </div>

                    {/* Live Weather & Atmospheric Microclimate Telemetry Banner */}
                    {analyzedLocation.weather && (
                      <div className="mt-3.5 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{analyzedLocation.weather.conditionIcon || '⛅'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {analyzedLocation.weather.condition}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                {analyzedLocation.weather.isLive ? 'LIVE MET' : 'SIMULATED'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5 font-mono">
                              <Clock className="h-3 w-3 text-cyan-400" />
                              <span>Local Time: <strong className="text-cyan-300">{analyzedLocation.weather.timeStr}</strong> ({analyzedLocation.weather.dateStr})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                          {/* Temp */}
                          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase font-bold flex items-center gap-1">
                              <Thermometer className="h-3 w-3 text-amber-400" /> Temperature
                            </span>
                            <span className="text-amber-300 font-black text-sm">{analyzedLocation.weather.temperatureC}</span>
                            <span className="text-[10px] text-slate-400 ml-1 font-sans">({analyzedLocation.weather.feelsLikeC})</span>
                          </div>

                          {/* Rain Chance */}
                          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase font-bold flex items-center gap-1">
                              <CloudRain className="h-3 w-3 text-blue-400" /> Rain Chance
                            </span>
                            <span className="text-blue-400 font-black text-sm">{analyzedLocation.weather.rainPercentageText}</span>
                            <span className="text-[10px] text-slate-400 ml-1 font-sans">({analyzedLocation.weather.precipitationMm})</span>
                          </div>

                          {/* Wind Speed */}
                          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase font-bold flex items-center gap-1">
                              <Wind className="h-3 w-3 text-cyan-400" /> Wind Velocity
                            </span>
                            <span className="text-cyan-300 font-black text-sm">{analyzedLocation.weather.windSpeedText}</span>
                            <span className="text-[10px] text-slate-400 ml-1 font-sans">{analyzedLocation.weather.windDirection}</span>
                          </div>

                          {/* Humidity */}
                          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase font-bold flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-teal-400" /> Humidity
                            </span>
                            <span className="text-teal-300 font-black text-sm">{analyzedLocation.weather.humidityText}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dossier Header Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSetAsPrimaryOrigin(analyzedLocation)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Set as Operational Base
                  </button>
                  <Link
                    to="/map"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                  >
                    <Navigation className="h-4 w-4" />
                    Tactical Map
                  </Link>
                  <button
                    onClick={() => handleClearAnalysis()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Close Dossier"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Dossier Tab Navigation Bar */}
              <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-900/70 overflow-x-auto">
                <button
                  onClick={() => setDossierTab('vulnerability')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                    dossierTab === 'vulnerability'
                      ? 'border-cyan-400 text-cyan-300 bg-slate-800/90 shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>4-Pillar Vulnerability Radar</span>
                </button>
                <button
                  onClick={() => setDossierTab('medical')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                    dossierTab === 'medical'
                      ? 'border-emerald-400 text-emerald-300 bg-slate-800/90 shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Hospital Proximity Network (Zero Beds)</span>
                </button>
                <button
                  onClick={() => setDossierTab('shelters')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                    dossierTab === 'shelters'
                      ? 'border-amber-400 text-amber-300 bg-slate-800/90 shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Evacuation Shelters ({analyzedLocation.shelters?.length || 3})</span>
                </button>
                <button
                  onClick={() => setDossierTab('tactical')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                    dossierTab === 'tactical'
                      ? 'border-purple-400 text-purple-300 bg-slate-800/90 shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>Tactical Protocol &amp; Deploy</span>
                </button>
                <button
                  onClick={() => setDossierTab('weather')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                    dossierTab === 'weather'
                      ? 'border-sky-400 text-sky-300 bg-slate-800/90 shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                  <span>Live Weather &amp; Atmosphere</span>
                </button>
              </div>

              {/* Dossier Content Tabs */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* ── TAB 1: 4-PILLAR VULNERABILITY BREAKDOWN ────────────────── */}
                {dossierTab === 'vulnerability' && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                        4-Pillar Sector Risk Decomposition
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {/* Pillar 1: Flood */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-blue-400 flex items-center gap-1.5">
                              <Waves className="h-4 w-4" /> Flood &amp; Inundation
                            </span>
                            <span className="font-black text-white text-sm">
                              {analyzedLocation.riskBreakdown?.flood || 75}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full transition-all"
                              style={{ width: `${analyzedLocation.riskBreakdown?.flood || 75}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">
                            Catchment overflow &amp; low elevation runoff vulnerability.
                          </p>
                        </div>

                        {/* Pillar 2: Cyclone */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-teal-400 flex items-center gap-1.5">
                              <Wind className="h-4 w-4" /> Cyclone &amp; Gale Force
                            </span>
                            <span className="font-black text-white text-sm">
                              {analyzedLocation.riskBreakdown?.cyclone || 60}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5">
                            <div
                              className="bg-gradient-to-r from-teal-600 to-emerald-400 h-2 rounded-full transition-all"
                              style={{ width: `${analyzedLocation.riskBreakdown?.cyclone || 60}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">
                            Coastal wind gust trajectory &amp; surge impact rating.
                          </p>
                        </div>

                        {/* Pillar 3: Infrastructure */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4" /> Road &amp; Drainage Choke
                            </span>
                            <span className="font-black text-white text-sm">
                              {analyzedLocation.riskBreakdown?.infrastructure || 70}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5">
                            <div
                              className="bg-gradient-to-r from-amber-600 to-orange-400 h-2 rounded-full transition-all"
                              style={{ width: `${analyzedLocation.riskBreakdown?.infrastructure || 70}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">
                            Low-lying bypass arterial roads susceptible to waterlogging.
                          </p>
                        </div>

                        {/* Pillar 4: Seismic */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                              <Zap className="h-4 w-4" /> Seismic &amp; Landslide
                            </span>
                            <span className="font-black text-white text-sm">
                              {analyzedLocation.riskBreakdown?.seismic || 20}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5">
                            <div
                              className="bg-gradient-to-r from-yellow-500 to-amber-400 h-2 rounded-full transition-all"
                              style={{ width: `${analyzedLocation.riskBreakdown?.seismic || 20}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">
                            Geologically stable alluvial foundation; minor tremor risk.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Active Hazards & Sector Telemetry Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Hazards in 50km */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4" /> Active Incidents within 50 km Radius
                          </h5>
                          <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                            {analyzedLocation.nearbyDisasters?.length || 0} Incident(s)
                          </span>
                        </div>
                        {analyzedLocation.nearbyDisasters && analyzedLocation.nearbyDisasters.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {analyzedLocation.nearbyDisasters.map((d) => (
                              <div
                                key={d.id}
                                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-red-400">{d.type}</span>
                                    <span className="text-xs text-white">in {d.areaName}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{d.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-bold text-white font-mono">{d.distanceKm} km</span>
                                  <span className="text-[10px] block text-red-400 uppercase font-bold">{d.severity || 'P1'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center rounded-lg bg-slate-950 border border-slate-800/80">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                            <p className="text-xs font-semibold text-emerald-300">No active hazardous alarms within 50 km</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Continuous regional sensor monitoring active at 60s intervals.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Sector Telemetry Model */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                              <Activity className="h-4 w-4" /> Real-Time Atmospheric &amp; Environmental Telemetry
                            </h5>
                            {analyzedLocation.weather?.timeStr && (
                              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                                🕒 {analyzedLocation.weather.timeStr}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-amber-400" /> Temperature &amp; Condition
                              </span>
                              <span className="text-base font-black text-white font-mono">
                                {analyzedLocation.weather?.temperatureC || '32°C'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {analyzedLocation.weather?.condition || 'Partly Cloudy'} (Feels {analyzedLocation.weather?.feelsLikeC || '35°C'})
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                                <CloudRain className="h-3 w-3 text-blue-400" /> Rain Probability &amp; Volume
                              </span>
                              <span className="text-base font-black text-blue-400 font-mono">
                                {analyzedLocation.weather?.rainPercentageText || '25%'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Precip: {analyzedLocation.weather?.precipitationMm || '0.0 mm/h'}
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                                <Wind className="h-3 w-3 text-cyan-400" /> Wind Velocity &amp; Heading
                              </span>
                              <span className="text-base font-black text-cyan-300 font-mono">
                                {analyzedLocation.weather?.windSpeedText || '14 km/h'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Direction: {analyzedLocation.weather?.windDirection || 'SE'} ({analyzedLocation.weather?.windDirectionDeg || 135}°)
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                                <Activity className="h-3 w-3 text-purple-400" /> River / Basin Level
                              </span>
                              <span className="text-base font-black text-white font-mono">
                                {analyzedLocation.environmentalTelemetry?.waterLevel || '4.1 m'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Humidity: {analyzedLocation.weather?.humidityText || '60%'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-3 font-mono">
                          Synchronized via Open-Meteo High-Resolution Satellite &amp; Doppler Doppler Radar Feed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: EMERGENCY HOSPITAL NETWORK (NO BEDS) ───────────── */}
                {dossierTab === 'medical' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <HeartPulse className="h-4 w-4" /> Regional Emergency Medical Facilities (Sorted by Distance)
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Hospital bed counts completely disabled. Routing optimized for rapid road transit &amp; ambulance fleets.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Zero Beds • Pure Proximity
                      </span>
                    </div>

                    {/* Closest Primary Hospital */}
                    {analyzedLocation.nearestHospital && (
                      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ★ CLOSEST PRIMARY FACILITY
                              </span>
                              <span className="text-xs text-slate-400">
                                {analyzedLocation.nearestHospital.emergency ? '24/7 Level-1 Trauma' : 'General Casualty'}
                              </span>
                            </div>
                            <h5 className="text-lg font-black text-white mt-1.5">
                              {analyzedLocation.nearestHospital.name}
                            </h5>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {analyzedLocation.nearestHospital.type || 'District Government Headquarter Hospital'}
                            </p>
                          </div>

                          <div className="flex items-center gap-5 bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 shrink-0 shadow-inner">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">Road Distance</span>
                              <span className="text-2xl sm:text-3xl font-black text-white">
                                {analyzedLocation.nearestHospital.distanceKm} km
                              </span>
                            </div>
                            <div className="border-l border-slate-800 pl-5">
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">Transit ETA</span>
                              <span className="text-lg sm:text-xl font-black text-emerald-400">
                                {analyzedLocation.nearestHospital.transitEta}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
                          <div className="flex items-center gap-4 text-slate-300">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <Ambulance className="h-4 w-4 text-cyan-400" />
                              Ambulances: <strong className="text-white">{analyzedLocation.nearestHospital.ambulances || 5} Units Stationed</strong>
                            </span>
                            <span>•</span>
                            <span>Hotline: <strong className="text-emerald-400">108</strong></span>
                          </div>

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${analyzedLocation.nearestHospital.lat},${analyzedLocation.nearestHospital.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                          >
                            <span>Navigate Google Maps Route</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Secondary & Backup Hospitals */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                        Alternative Regional Emergency Facilities
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(analyzedLocation.backupHospitals || []).map((bh, bIdx) => (
                          <div key={bh.id || bIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-bold text-slate-300">RANK #{bIdx + 2} FACILITY</span>
                                <span className="text-slate-400 text-[11px]">{bh.emergency ? '24/7 Emergency' : 'General Care'}</span>
                              </div>
                              <p className="text-sm font-bold text-white line-clamp-1">{bh.name}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-base font-black text-white">{bh.distanceKm} km</span>
                                <span className="text-xs font-semibold text-emerald-400">ETA: {bh.transitEta}</span>
                                <span className="text-xs text-slate-400">🚑 {bh.ambulances || 4} units</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${bh.lat},${bh.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                              >
                                <span>Directions</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: EVACUATION SHELTERS & RELIEF HUBS ───────────────── */}
                {dossierTab === 'shelters' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                        <Home className="h-4 w-4" /> Designated Evacuation Shelters &amp; Civilian Safe Havens
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Relief shelters equipped with emergency power generators, clean water, and triage supplies.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {(analyzedLocation.shelters || []).map((sh) => (
                        <div key={sh.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-amber-400">{sh.type}</span>
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-black">
                                {sh.status}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-white mt-1">{sh.name}</h5>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                              <span>Distance: <strong className="text-white">{sh.distanceKm} km</strong></span>
                              <span>•</span>
                              <span>ETA: <strong className="text-emerald-400">{sh.transitEta}</strong></span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Intake Capacity: <strong className="text-white">{sh.capacity}</strong>
                            </p>

                            {/* Facilities Checklist */}
                            <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1">
                              {sh.facilities?.map((f, fIdx) => (
                                <div key={fIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                  <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Relief Hub #{sh.id}</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sh.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              <span>Navigate</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 4: TACTICAL PROTOCOL & RESCUE SQUAD DISPATCH ───────── */}
                {dossierTab === 'tactical' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="pb-2 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 font-mono">
                          <Radio className="h-4 w-4" /> Incident Command Action Protocol &amp; Force Deployment
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Real-time synthesized SOP for swiftwater rescue, civil defense mutual aid, and sector staging.
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickDeployToSector(analyzedLocation)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Dispatch Standby Unit Here
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Recommended Deployment */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                          Recommended Squad &amp; Force Allocation
                        </h5>
                        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                          <p className="text-xs text-slate-400">Target Force Recommendation:</p>
                          <p className="text-sm font-bold text-purple-300 mt-0.5">
                            {analyzedLocation.deploymentAdvice?.squadType}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Units Suggested: <strong className="text-white">{analyzedLocation.deploymentAdvice?.recommendedSquads} Squad(s)</strong> (Approx 20-30 Personnel)
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2 font-mono">Specialized Gear Manifest:</p>
                          <div className="space-y-1.5">
                            {analyzedLocation.deploymentAdvice?.equipment?.map((eq, eqIdx) => (
                              <div key={eqIdx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 font-bold">•</span>
                                <span>{eq}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Route Advisory & Safety Corridors */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                            Evacuation Corridors &amp; Hazard Vectors
                          </h5>
                          <div className="p-3.5 rounded-lg bg-emerald-950/25 border border-emerald-500/40">
                            <span className="text-xs font-bold text-emerald-400 block mb-0.5">
                              ✓ Primary Safe Corridor
                            </span>
                            <p className="text-xs text-slate-300">
                              {analyzedLocation.deploymentAdvice?.safeCorridor}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-lg bg-red-950/25 border border-red-500/40">
                            <span className="text-xs font-bold text-red-400 block mb-0.5">
                              ⚠️ Cautionary Danger Zones
                            </span>
                            <p className="text-xs text-slate-300">
                              {analyzedLocation.deploymentAdvice?.cautionZone}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-mono">Code: EOC-TN</span>
                          <Link
                            to="/recommendations"
                            className="font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <span>Open Full Tactical Recommendations</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: LIVE WEATHER & METEOROLOGICAL TELEMETRY ────────── */}
                {dossierTab === 'weather' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="pb-2 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-mono">
                          <CloudRain className="h-4 w-4" /> Live Meteorological Observatory &amp; Microclimate HUD
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          High-resolution satellite feeds, hourly precipitation models, and wind vectors for {analyzedLocation.name}.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                          </span>
                          {analyzedLocation.weather?.isLive ? 'LIVE OPEN-METEO TELEMETRY' : 'CALIBRATED WEATHER FEED'}
                        </span>
                      </div>
                    </div>

                    {/* Meteorological Hero Overview */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-950 border border-sky-500/30 shadow-xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl drop-shadow-md select-none">
                            {analyzedLocation.weather?.conditionIcon || '⛅'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl sm:text-2xl font-black text-white">
                                {analyzedLocation.weather?.condition || 'Clear Sky'}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                {analyzedLocation.weather?.isLive ? 'Active Feed' : 'Calibrated'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                              <span>Perceived Comfort: <strong className="text-amber-300">{analyzedLocation.weather?.feelsLikeC || analyzedLocation.weather?.temperatureC || 'Normal'}</strong></span>
                              <span>•</span>
                              <span>Sector Coords: <strong className="text-slate-300 font-mono">{analyzedLocation.lat?.toFixed(4)}, {analyzedLocation.lng?.toFixed(4)}</strong></span>
                            </p>
                          </div>
                        </div>

                        {/* Chrono Digital Clock Card */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center gap-4 shrink-0 shadow-inner">
                          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                            <Clock className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block font-mono">
                              Local Station Clock
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono tracking-tight">
                              {analyzedLocation.weather?.timeStr || currentTime.toLocaleTimeString()}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {analyzedLocation.weather?.dateStr || 'Today'} · {analyzedLocation.weather?.timezone || 'Asia/Kolkata'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4 Primary Meteorological Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Metric 1: Temperature */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                              <Thermometer className="h-4 w-4" /> AIR TEMPERATURE
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                              2m Sensor
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-3xl font-black text-white font-mono tracking-tight">
                              {analyzedLocation.weather?.temperatureC || '32°C'}
                            </span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">
                              Feels {analyzedLocation.weather?.feelsLikeC || '35°C'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Thermal Index:</span>
                          <strong className="text-amber-300">
                            {parseInt(analyzedLocation.weather?.temperatureC) > 35 ? 'High Thermal Load' : 'Moderate Temperate'}
                          </strong>
                        </div>
                      </div>

                      {/* Metric 2: Rain Chance */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-blue-400 flex items-center gap-1.5 font-mono">
                              <CloudRain className="h-4 w-4" /> PRECIPITATION PROBABILITY
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                              Doppler Rain
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-3xl font-black text-blue-400 font-mono tracking-tight">
                              {analyzedLocation.weather?.rainPercentageText || '0%'}
                            </span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">
                              {analyzedLocation.weather?.precipitationMm || '0.0 mm/h'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800">
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(analyzedLocation.weather?.rainPercentage || 0, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                            <span>Probability Meter</span>
                            <span>{analyzedLocation.weather?.rainPercentageText || '0%'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Metric 3: Wind Velocity */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                              <Wind className="h-4 w-4" /> WIND VELOCITY &amp; VECTOR
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                              10m Anemometer
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-3xl font-black text-cyan-300 font-mono tracking-tight">
                              {analyzedLocation.weather?.windSpeedText || '12 km/h'}
                            </span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">
                              {analyzedLocation.weather?.windDirection || 'SE'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Compass Azimuth:</span>
                          <strong className="text-cyan-300 font-mono">
                            {analyzedLocation.weather?.windDirectionDeg || 135}° Heading
                          </strong>
                        </div>
                      </div>

                      {/* Metric 4: Relative Humidity */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-teal-400 flex items-center gap-1.5 font-mono">
                              <Droplets className="h-4 w-4" /> RELATIVE HUMIDITY
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                              Hygrometer
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-3xl font-black text-teal-300 font-mono tracking-tight">
                              {analyzedLocation.weather?.humidityText || '55%'}
                            </span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">
                              Dewpoint index
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Moisture Saturation:</span>
                          <strong className="text-teal-300">
                            {parseInt(analyzedLocation.weather?.humidityText) > 75 ? 'Heavy Dew' : 'Normal Vapor'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Meteorological Advisory & Disaster Dispatch Insights */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0 mt-0.5">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                            Operational Meteorological Readiness &amp; Dispatch Impact
                          </h5>
                          <p className="text-xs text-slate-300 mt-1">
                            {(analyzedLocation.weather?.rainPercentage || 0) > 50
                              ? '⚠️ Elevated rain probability detected. Pre-position high-clearance water rescue units and inspect storm runoff conduits.'
                              : (analyzedLocation.weather?.windSpeedKmH || 0) > 35
                              ? '⚠️ High wind advisory in effect. Drone aerial reconnaissance restricted; secure light temporary structures.'
                              : '✓ Standard operational atmosphere. Visual flight rules and terrestrial emergency vehicle transit unobstructed.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to="/map"
                          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          <span>View on Tactical Map</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TACTICAL KPI METRICS DECK (4 High-Impact Cyber Cards) ───────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass-card p-5 flex items-start gap-4 shadow-xl ${card.glow} hover:translate-y-[-2px] transition-transform`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-black/40`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {card.label}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-0.5 truncate tracking-tight">{card.value}</p>
                <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                  {card.subtext}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {card.trendUp === true && <TrendingUp className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                  {card.trendUp === false && <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                  <span className="text-[11px] text-slate-400 truncate font-medium">{card.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── EMERGENCY MEDICAL PROXIMITY HUB (Distance & ETA ONLY, ZERO BEDS) ─ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 glass-card p-5 sm:p-6 border border-slate-700/70 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
              <Ambulance className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  Emergency Medical Proximity Network
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">
                  REAL-TIME DISTANCE &amp; TRANSIT ETA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Relative to <span className="text-white font-bold">{activeOrigin.name}</span> • Bed capacity tracking disabled; focus on rapid routing &amp; ambulances
              </p>
            </div>
          </div>

          <Link
            to="/hospitals"
            className="self-start sm:self-auto text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All {hospitals.length} Hospitals</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Top 3 Closest Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitals.slice(0, 3).map((hosp, idx) => (
            <div
              key={hosp.id || idx}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all group shadow-sm hover:shadow-cyan-500/10"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      idx === 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {idx === 0 ? '★ CLOSEST FACILITY' : `RANK #${idx + 1}`}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {hosp.emergency ? '24/7 Trauma Care' : 'General Casualty'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {hosp.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{hosp.type || 'District Trauma Center'}</p>

                {/* Distance & ETA Callout */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Distance</span>
                    <span className="text-xl sm:text-2xl font-black text-white">{hosp.distance} km</span>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Transit ETA</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400">{hosp.transitEta}</span>
                  </div>
                </div>

                {/* Ambulance fleet */}
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Ambulance className="h-3.5 w-3.5 text-cyan-400" />
                    Fleet Ambulances:
                  </span>
                  <span className="font-bold text-white bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700 font-mono">
                    {hosp.ambulances || 4} units
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`tel:${hosp.phone || '108'}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="h-3 w-3 text-emerald-400" />
                  <span>Call 108</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Directions</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── LIVE TAMIL NADU SENSOR SUITE & RESOURCE TRACKER ────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 space-y-6">
        <LiveDataDashboard />
        <ResourceTracker />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── MONITORED PRIORITY ZONES ───────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10">
        {/* Affected Monitored Zones with Distances */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Monitored Priority Zones
              </h2>
              <span className="text-[10px] text-slate-300 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                {areasCount} Zones
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {sortedAreas.map((area) => {
                const pCfg = priorityConfig[area.priority] || priorityConfig.P3;
                const distFromOrigin = calculateDistanceKm(
                  activeOrigin.lat,
                  activeOrigin.lng,
                  area.lat,
                  area.lng
                );

                return (
                  <div
                    key={area.id}
                    onClick={() => {
                      handleSelectLocation({
                        id: area.id,
                        name: area.name,
                        specificArea: area.name,
                        city: area.name,
                        district: area.name,
                        lat: area.lat,
                        lng: area.lng,
                      });
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-3 rounded-xl bg-slate-900/80 border border-slate-800 px-3.5 py-2.5 hover:bg-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all group"
                    title={`Click to analyze ${area.name} and auto-fetch real-time weather`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                            {area.name}
                          </span>
                          {distFromOrigin != null && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({distFromOrigin} km)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-cyan-400 group-hover:underline hidden sm:inline">
                            Auto Weather →
                          </span>
                          <span className="text-xs font-black text-white tabular-nums font-mono">
                            {area.riskPercent}%
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded border ${pCfg.color}`}
                          >
                            {area.priority}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${pCfg.bar} transition-all duration-500`}
                          style={{ width: `${area.riskPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Critical alerts active in {criticalHazards} zones</span>
            <Link to="/map" className="text-cyan-400 hover:text-cyan-300 font-bold">
              Explore on Map →
            </Link>
          </div>
        </div>
      </div>

      {/* Live Multi-Sensor Telemetry Matrix */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Multi-Sensor Hardware Telemetry
              </h2>
              <p className="text-xs text-slate-400">Live hardware telemetry polling every 3 seconds</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">
                POLLING ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {sensorDisplays.map((sensor) => {
              const SIcon = sensor.icon;
              const pct = Math.min((sensor.data.value / sensor.data.threshold) * 100, 100);
              const barColorClass = sensorBarColor(pct);
              return (
                <div
                  key={sensor.key}
                  className={`rounded-xl bg-slate-900/90 border p-3.5 flex flex-col justify-between ${sensor.glow}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SIcon className={`h-4 w-4 ${sensor.iconColor}`} />
                      <span className="text-xs font-bold text-slate-300">{sensor.label}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        sensor.data.trend === 'rising'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {sensor.data.trend === 'rising' ? '▲ RISING' : '■ STEADY'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white tabular-nums tracking-tight">
                    {sensor.data.value}{' '}
                    <span className="text-xs font-normal text-slate-400">{sensor.data.unit}</span>
                  </p>
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                      <span>{Math.round(pct)}% threshold</span>
                      <span>
                        Max: {sensor.data.threshold} {sensor.data.unit}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${barColorClass} transition-all duration-700`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      {/* ─── FUTURE ROADMAP ADVANCED OPERATIONS HUB ───────────────────────── */}
      <FutureRoadmapOperationsHub />

      {/* Reservoir Telemetry - TN WRD 1-Hour Feed */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Reservoir Telemetry
            </h2>
            <p className="text-xs text-slate-400">TN, Karnataka, AP - Auto-refresh every 1 hour</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
              1-HR WRD FEED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(() => {
            const damDataLocal = localStorage.getItem('resqai_dams_real_v2');
            let damsToShow = [];

            if (damDataLocal) {
              try {
                const parsed = JSON.parse(damDataLocal);
                damsToShow = parsed.slice(0, 5);
              } catch (e) {
                damsToShow = tnDamData.slice(0, 5);
              }
            } else {
              damsToShow = tnDamData.slice(0, 5);
            }

            return damsToShow.map((dam) => {
              const fillPct = ((dam.currentLevel / dam.fullReservoirLevel) * 100).toFixed(1);
              const barColor = fillPct >= 75 ? 'bg-red-500' : fillPct >= 50 ? 'bg-yellow-500' : 'bg-cyan-500';
              const textColor = fillPct >= 75 ? 'text-red-400' : fillPct >= 50 ? 'text-yellow-400' : 'text-cyan-400';

              return (
                <div
                  key={dam.name}
                  className="rounded-xl bg-slate-900/90 border border-slate-700 p-3 flex flex-col"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Droplets className={`h-3.5 w-3.5 ${textColor}`} />
                    <span className="text-xs font-bold text-slate-300">{dam.name}</span>
                  </div>
                  <p className="text-lg font-black text-white tabular-nums">
                    {fillPct}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">%</span>
                  </p>
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-700`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      {dam.currentLevel} / {dam.fullReservoirLevel} ft
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Live telemetry from 18 major reservoirs across TN, Karnataka & AP</span>
          <Link to="/dams" className="text-cyan-400 hover:text-cyan-300 font-bold">
            View Full Dam Feed →
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── LIVE EMERGENCY ALERTS STREAM ───────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Tactical Incident &amp; Alert Stream
            </h2>
          </div>
          <Link
            to="/alerts"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Full Alert Feed ({contextAlerts ? contextAlerts.length : alerts.length})</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentAlerts.map((alert) => {
            const AIcon = alertIconMap[alert.type] || AlertCircle;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3.5 rounded-xl bg-slate-900/80 border-l-4 ${alertBorderColor[alert.type] || 'border-l-blue-500'} p-4 hover:bg-slate-900 transition-colors shadow-sm`}
              >
                <AIcon
                  className={`h-5 w-5 mt-0.5 shrink-0 ${alertTextColor[alert.type] || 'text-blue-400'} ${
                    alert.type === 'critical' ? 'animate-pulse' : ''
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-200 truncate">
                      {alert.title || alert.area || 'Tactical Alert'}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{alert.message}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider ${
                      alert.type === 'critical'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : alert.type === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {alert.priority || alert.type}
                  </span>
                  {alert.disasterId && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeDisaster(alert.disasterId);
                      }}
                      className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/40 px-2 py-0.5 rounded font-bold uppercase transition-colors shadow-sm"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
