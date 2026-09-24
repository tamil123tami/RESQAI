import { useEffect, useState, useRef } from 'react';
import {
  Map,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Users,
  Building2,
  Layers,
  Crosshair,
  ShieldAlert,
  Search,
  Compass,
  Navigation,
  Clock,
  Sparkles,
  X,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchLocations, analyzeLocationRisk } from '../services/locationService';
import { fetchRealtimeWeather } from '../services/weatherService';
import { fetchRainViewerRadarInfo, fetchLiveSeismicTelemetry } from '../services/realtimeTelemetryService';
import { tnDamData } from '../data/damData';

const priorityColors = { P1: '#ef4444', P2: '#f97316', P3: '#eab308', P4: '#3b82f6' };

const disasterIcons = {
  flood: '🌊',
  cyclone: '🌀',
  earthquake: '🌍',
  volcanic: '🌋',
};

function MapView() {
  const {
    disasters,
    teams,
    hospitals,
    monitoredAreas: liveAreas,
    userLocation,
    detectUserLocation,
    isDetectingLocation,
    selectedSearchLocation,
    setSearchLocation,
    autoDeployTeam,
    isLiveTracking,
    setIsLiveTracking,
    gpsTrackerTelemetry,
    simulateGpsMovement,
    distanceOrigin,
  } = useApp();

  const distLabel = distanceOrigin?.isDisaster ? 'Distance from disaster' : 'Distance from you';

  const [autoFollowGps, setAutoFollowGps] = useState(true);

  const [map, setMap] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [leafletLib, setLeafletLib] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationAnalysis, setLocationAnalysis] = useState(null);

  // ── Auto-Fetch Weather for Command Base / Current User Location ─────────
  const [userLocationWeather, setUserLocationWeather] = useState(null);

  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) return;
    let active = true;
    fetchRealtimeWeather(
      userLocation.lat,
      userLocation.lng,
      userLocation.name || 'Command Base'
    ).then((w) => {
      if (active && w) setUserLocationWeather(w);
    });
    return () => {
      active = false;
    };
  }, [userLocation?.lat, userLocation?.lng, userLocation?.name]);

  // ── Auto-Fetch Weather for ANY Entity Clicked / Viewed on Map ───────────
  useEffect(() => {
    if (!selectedEntity?.data) return;
    const { lat, lng } = selectedEntity.data;
    const name =
      selectedEntity.data.name ||
      selectedEntity.data.areaName ||
      selectedEntity.data.locationName ||
      'Viewed Sector';
    if (!lat || !lng) return;

    let active = true;
    fetchRealtimeWeather(lat, lng, name).then((liveWeather) => {
      if (active && liveWeather) {
        setSelectedEntity((prev) => {
          if (!prev || !prev.data) return prev;
          return {
            ...prev,
            weather: liveWeather,
          };
        });
      }
    });

    return () => {
      active = false;
    };
  }, [
    selectedEntity?.data?.lat,
    selectedEntity?.data?.lng,
    selectedEntity?.data?.name,
    selectedEntity?.data?.areaName,
  ]);

  // Layer filter toggles
  const [showDisasters, setShowDisasters] = useState(true);
  const [showTeams, setShowTeams] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showDams, setShowDams] = useState(true);
  const [showRadar, setShowRadar] = useState(false);
  const [showSeismic, setShowSeismic] = useState(true);
  const [radarTime, setRadarTime] = useState(null);
  const [liveEarthquakes, setLiveEarthquakes] = useState([]);

  // Layer groups refs
  const layerGroupsRef = useRef({
    zones: null,
    disasters: null,
    teams: null,
    hospitals: null,
    dams: null,
    radar: null,
    seismic: null,
    userMarker: null,
    searchMarker: null,
  });

  // Handle Search Input Change
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        setLeafletLib(L);

        const container = L.DomUtil.get('map-container');
        if (container != null) {
          container._leaflet_id = null;
        }

        // Center on South India (Tamil Nadu, Karnataka, Andhra Pradesh)
        const initialLat = userLocation?.lat || 12.5;
        const initialLng = userLocation?.lng || 78.0;

        const mapInstance = L.map('map-container').setView([initialLat, initialLng], 7);

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        // Pause auto-follow when user drags or zooms the map manually
        mapInstance.on('movestart', (e) => {
          if (e.originalEvent) {
            setAutoFollowGps(false);
          }
        });

        // Initialize layer groups
        layerGroupsRef.current.zones = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.disasters = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.teams = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.hospitals = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.dams = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.radar = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.seismic = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.userMarker = L.layerGroup().addTo(mapInstance);
        layerGroupsRef.current.searchMarker = L.layerGroup().addTo(mapInstance);

        setMap(mapInstance);
      });
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Update User Live Location Pin, Breadcrumbs Trail, Accuracy Circle & Real-time Pan
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.userMarker) return;
    const group = layerGroupsRef.current.userMarker;
    group.clearLayers();

    const lat = userLocation.lat;
    const lng = userLocation.lng;
    if (!lat || !lng) return;

    // 1. Draw Breadcrumb Trail (past locations while moving)
    if (gpsTrackerTelemetry?.breadcrumbs?.length > 1) {
      const trailPoints = gpsTrackerTelemetry.breadcrumbs.map((b) => [b.lat, b.lng]);
      leafletLib.polyline(trailPoints, {
        color: '#06b6d4',
        weight: 3,
        opacity: 0.75,
        dashArray: '6, 6',
      }).addTo(group);
    }

    // 2. Draw Accuracy Radius Circle
    leafletLib.circle([lat, lng], {
      radius: Math.min(userLocation.accuracy || 25, 2000),
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(group);

    // 3. Draw Pulsing Radar Beacon
    const icon = leafletLib.divIcon({
      className: 'user-radar-marker',
      html: `
        <div style="position: relative;">
          <div style="
            position: absolute;
            width: 48px;
            height: 48px;
            top: -14px;
            left: -14px;
            border-radius: 50%;
            background: rgba(6, 182, 212, 0.35);
            animation: radarPing 1.8s infinite cubic-bezier(0, 0, 0.2, 1);
          "></div>
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            top: -6px;
            left: -6px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.4);
            animation: radarPing 2.5s infinite ease-out;
          "></div>
          <div style="
            width: 20px;
            height: 20px;
            background: #06b6d4;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(6, 182, 212, 1), 0 0 30px rgba(16, 185, 129, 0.6);
            position: relative;
            z-index: 5;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = leafletLib.marker([lat, lng], { icon }).addTo(group);
    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 210px; padding: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #06b6d4; font-weight: 800; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">🛰️ Live GPS Tracker</span>
          <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">LIVE LOCK</span>
        </div>
        <div style="font-weight: 800; font-size: 13px; margin-top: 6px; color: #f8fafc;">${userLocation.name}</div>
        ${userLocation.specificArea ? `<div style="font-size: 11px; color: #38bdf8; font-weight: 600; margin-top: 2px;">📍 Sector: ${userLocation.specificArea}</div>` : ''}
        <div style="font-size: 11px; color: #ef4444; font-weight: 700; margin-top: 4px;">
          🛡️ ${userLocation.zone?.code || 'ZONE-IV'}: ${userLocation.zone?.name || 'Vulnerability Zone'}
        </div>
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 6px; border-top: 1px solid #334155; padding-top: 4px; line-height: 1.4;">
          Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}<br/>
          Accuracy: ±${userLocation.accuracy || 15}m • State: ${gpsTrackerTelemetry?.movementState || 'STATIONARY'}
        </div>
      </div>
    `);

    // Smooth pan / follow
    if (autoFollowGps && userLocation.isDetected) {
      map.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  }, [map, leafletLib, userLocation, gpsTrackerTelemetry, autoFollowGps]);

  // Update Search Marker & Location Analysis
  const handleSelectLocation = (loc) => {
    setAutoFollowGps(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchLocation(loc);

    const analysis = analyzeLocationRisk(
      loc.lat,
      loc.lng,
      loc.name,
      disasters,
      liveAreas,
      hospitals
    );
    setLocationAnalysis(analysis);

    // Asynchronously fetch live real-time weather (time, temperature, rain %, wind speed)
    fetchRealtimeWeather(loc.lat, loc.lng, loc.name).then((liveWeather) => {
      setLocationAnalysis((prev) => (prev ? { ...prev, weather: liveWeather } : prev));
    });

    if (map && leafletLib && layerGroupsRef.current.searchMarker) {
      const group = layerGroupsRef.current.searchMarker;
      group.clearLayers();

      const icon = leafletLib.divIcon({
        className: 'search-target-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #dc2626;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 0 16px rgba(220, 38, 38, 0.9);
            font-size: 14px;
            animation: pulse 1.5s infinite;
          ">
            🎯
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const weather = analysis.weather || {};
      leafletLib.marker([loc.lat, loc.lng], { icon })
        .addTo(group)
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 230px; padding: 2px;">
            <div style="font-weight: bold; font-size: 13px; color: #dc2626;">🎯 Target Analysis Area</div>
            <div style="font-weight: 700; font-size: 13px; color: #1e293b; margin: 2px 0;">${loc.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Risk Rating: <strong style="color: #dc2626;">${analysis.calculatedRisk}%</strong></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; font-size: 11px; color: #334155; line-height: 1.6;">
              <div style="font-weight: 700; color: #0284c7; margin-bottom: 2px;">⛅ Live Atmospheric Telemetry</div>
              <div>🕒 <strong>Local Time:</strong> ${weather.timeStr || new Date().toLocaleTimeString()}</div>
              <div>🌡️ <strong>Temp:</strong> ${weather.temperatureC || '32°C'} (${weather.condition || 'Partly Cloudy'})</div>
              <div>🌧️ <strong>Rain Risk:</strong> ${weather.rainPercentageText || '20%'} (${weather.precipitationMm || '0.0 mm/h'})</div>
              <div>💨 <strong>Wind Speed:</strong> ${weather.windSpeedText || '15 km/h'} ${weather.windDirection || 'SE'}</div>
            </div>
          </div>
        `)
        .openPopup();

      map.flyTo([loc.lat, loc.lng], 12, { duration: 1.5 });
    }
  };

  // Update Search Location Marker (from Dashboard or other pages)
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.searchMarker) return;
    const group = layerGroupsRef.current.searchMarker;
    group.clearLayers();

    if (!selectedSearchLocation || !selectedSearchLocation.lat || !selectedSearchLocation.lng) return;

    const icon = leafletLib.divIcon({
      className: 'search-target-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #dc2626;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 16px rgba(220, 38, 38, 0.9);
          font-size: 14px;
          animation: pulse 1.5s infinite;
        ">
          🎯
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    leafletLib.marker([selectedSearchLocation.lat, selectedSearchLocation.lng], { icon })
      .addTo(group)
      .bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 230px; padding: 2px;">
          <div style="font-weight: bold; font-size: 13px; color: #dc2626;">🎯 Custom Location</div>
          <div style="font-weight: 700; font-size: 13px; color: #1e293b; margin: 2px 0;">${selectedSearchLocation.name || 'Search Target'}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            Coordinates: ${selectedSearchLocation.lat.toFixed(5)}, ${selectedSearchLocation.lng.toFixed(5)}
          </div>
          ${selectedSearchLocation.zone ? `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; font-size: 11px; color: #334155;">
              <div><strong>Zone:</strong> ${selectedSearchLocation.zone.code || 'N/A'}</div>
              <div><strong>Hazard:</strong> ${selectedSearchLocation.zone.name || 'N/A'}</div>
            </div>
          ` : ''}
        </div>
      `)
      .openPopup();

    map.flyTo([selectedSearchLocation.lat, selectedSearchLocation.lng], 13, { duration: 1.5 });
  }, [map, leafletLib, selectedSearchLocation]);

  // Update Monitored Zones Layer
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.zones) return;
    const group = layerGroupsRef.current.zones;
    group.clearLayers();

    if (!showZones) return;

    liveAreas.forEach((area) => {
      const color = priorityColors[area.priority] || '#3b82f6';
      const radius = 5000 + ((area.riskPercent || 40) / 100) * 15000;

      const icon = leafletLib.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${20 + (area.riskPercent || 30) / 5}px;
            height: ${20 + (area.riskPercent || 30) / 5}px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.5), 0 0 15px ${color}80;
            animation: ${area.priority === 'P1' ? 'pulse 2s infinite' : 'none'};
          "></div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = leafletLib.marker([area.lat, area.lng], { icon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-width: 220px; background: #0f172a; padding: 14px; border-radius: 10px; border: 3px solid ${color}; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
          <div style="margin-bottom: 10px;">
            <div style="font-size: 16px; color: #ffffff; font-weight: 700; margin-bottom: 4px;">${area.name}</div>
            <span style="display: inline-block; background: ${color}; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700;">${area.priority}</span>
          </div>
          <div style="font-size: 13px; line-height: 2;">
            <div style="margin-bottom: 6px;">
              <span style="color: #94a3b8; font-weight: 600;">Risk Level:</span>
              <span style="color: #ffffff; font-weight: 700; font-size: 16px; margin-left: 8px;">${area.riskPercent}%</span>
            </div>
            <div style="margin-bottom: 6px;">
              <span style="color: #94a3b8; font-weight: 600;">${distLabel}:</span>
              <span style="color: #22d3ee; font-weight: 600; margin-left: 8px;">${area.distanceFromUserKm || 'N/A'} km</span>
            </div>
            <div>
              <span style="color: #94a3b8; font-weight: 600;">Population:</span>
              <span style="color: #fbbf24; font-weight: 600; margin-left: 8px;">${area.population ? area.population.toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedEntity({ type: 'area', data: area });
      });

      leafletLib.circle([area.lat, area.lng], {
        color,
        fillColor: color,
        fillOpacity: 0.12,
        radius,
        weight: 1.5,
      }).addTo(group);
    });
  }, [map, leafletLib, liveAreas, showZones]);

  // Update Disasters Layer
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.disasters) return;
    const group = layerGroupsRef.current.disasters;
    group.clearLayers();

    if (!showDisasters) return;

    disasters.filter((d) => d.status !== 'completed').forEach((disaster) => {
      const emoji = disasterIcons[disaster.type] || '⚠️';
      const isAssigned = disaster.status === 'assigned';
      const severityColor = isAssigned ? '#3b82f6' : disaster.severity === 'critical' ? '#ef4444' : disaster.severity === 'high' ? '#f97316' : '#eab308';
      const statusLabel = isAssigned ? 'ASSIGNED' : `${disaster.riskPercent}% RISK`;

      const icon = leafletLib.divIcon({
        className: 'disaster-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 38px;
              height: 38px;
              background: #0f172a;
              border: 3px solid ${severityColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              box-shadow: 0 0 15px ${severityColor}, 0 0 25px rgba(239, 68, 68, 0.4);
              animation: pulse 1.5s infinite;
            ">
              ${emoji}
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: ${severityColor};
              color: white;
              font-size: 9px;
              font-weight: 800;
              padding: 1px 5px;
              border-radius: 4px;
              white-space: nowrap;
              text-transform: uppercase;
            ">
              ${statusLabel}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const teamLine = disaster.assignedTeamName
        ? `<div style="margin-top:4px;"><strong>Team:</strong> <span style="color:#3b82f6; font-weight:bold;">${disaster.assignedTeamName}</span></div>`
        : '';

      const marker = leafletLib.marker([disaster.lat, disaster.lng], { icon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 220px; background: #1e293b; padding: 12px; border-radius: 8px; border: 2px solid #ef4444;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 24px;">${emoji}</span>
            <div>
              <strong style="font-size: 15px; color: #ef4444; text-transform: uppercase; display: block;">${disaster.type} ALARM</strong>
              <div style="font-size: 11px; color: #94a3b8;">${disaster.areaName}</div>
            </div>
          </div>
          <p style="font-size: 12px; color: #e2e8f0; margin: 4px 0 8px;">${disaster.description}</p>
          <div style="background: #0f172a; padding: 8px; border-radius: 6px; font-size: 12px; color: #e2e8f0; line-height: 1.8;">
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Status:</strong> <span style="color:${severityColor}; font-weight: bold; text-transform: uppercase;">${disaster.status}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Severity:</strong> <span style="color:${severityColor}; font-weight: bold; text-transform: capitalize; font-size: 13px;">${disaster.severity}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Risk Rating:</strong> <span style="color: #fbbf24; font-weight: bold;">${disaster.riskPercent}%</span></div>
            ${teamLine}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedEntity({ type: 'disaster', data: disaster });
      });

      leafletLib.circle([disaster.lat, disaster.lng], {
        color: severityColor,
        fillColor: severityColor,
        fillOpacity: 0.2,
        radius: 12000,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(group);
    });
  }, [map, leafletLib, disasters, showDisasters]);

  // Update Deployed Teams Layer
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.teams) return;
    const group = layerGroupsRef.current.teams;
    group.clearLayers();

    if (!showTeams) return;

    const deployedTeams = teams.filter((t) => t.status === 'deployed');
    deployedTeams.forEach((team) => {
      const targetArea = liveAreas.find((a) => a.name === team.location || a.name === team.assignedArea);
      const lat = targetArea ? targetArea.lat + 0.015 : 11.75 + (Math.random() - 0.5) * 0.05;
      const lng = targetArea ? targetArea.lng + 0.015 : 79.77 + (Math.random() - 0.5) * 0.05;

      const icon = leafletLib.divIcon({
        className: 'team-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #9333ea;
            border: 2px solid white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 0 12px rgba(147, 51, 234, 0.8);
            font-size: 14px;
          ">
            🚁
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = leafletLib.marker([lat, lng], { icon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px; background: #1e293b; padding: 12px; border-radius: 8px; border: 2px solid #8b5cf6;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">🚁</span>
            <div>
              <strong style="font-size: 14px; color: #8b5cf6; display: block;">${team.name}</strong>
              <div style="font-size: 11px; color: #94a3b8;">${team.members} Officers Deployed</div>
            </div>
          </div>
          <div style="font-size: 12px; color: #e2e8f0; line-height: 1.8;">
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Assigned Sector:</strong> <span style="color: #22d3ee;">${team.location || team.assignedArea}</span></div>
            <div><strong style="color: #ffffff;">Operation:</strong> <span style="color: #fbbf24;">${team.mission}</span></div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedEntity({ type: 'team', data: team });
      });
    });
  }, [map, leafletLib, teams, liveAreas, showTeams]);

  // Update Hospitals Layer (Simplified: Distance and Transit only, NO beds)
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.hospitals) return;
    const group = layerGroupsRef.current.hospitals;
    group.clearLayers();

    if (!showHospitals) return;

    hospitals.forEach((hosp) => {
      const color = hosp.emergency ? '#10b981' : '#3b82f6';

      const icon = leafletLib.divIcon({
        className: 'hospital-marker',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #064e3b;
            border: 2px solid ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
            font-size: 13px;
            font-weight: bold;
          ">
            ✚
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = leafletLib.marker([hosp.lat, hosp.lng], { icon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 210px; background: #1e293b; padding: 12px; border-radius: 8px; border: 2px solid #10b981;">
          <strong style="font-size: 14px; color: #ffffff; display: block; margin-bottom: 8px;">🏥 ${hosp.name}</strong>
          <div style="color: #e2e8f0; font-size: 12px; line-height: 1.8;">
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">${distLabel}:</strong> <span style="color: #10b981; font-weight: bold;">${hosp.distance} km</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Transit Time:</strong> <span style="color: #22d3ee;">${hosp.transitEta || '15 mins'}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Ambulance Units:</strong> <span style="color: #fbbf24;">${hosp.ambulances} Ready</span></div>
            <div><strong style="color: #ffffff;">Emergency Care:</strong> <span style="color: ${hosp.emergency ? '#10b981' : '#94a3b8'};">${hosp.emergency ? '24/7 Trauma Service' : 'General'}</span></div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedEntity({ type: 'hospital', data: hosp });
      });
    });
  }, [map, leafletLib, hospitals, showHospitals]);

  // Update Dams Layer
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.dams) return;
    const group = layerGroupsRef.current.dams;
    group.clearLayers();

    if (!showDams) return;

    // Get dam data from localStorage or fallback to tnDamData
    let damsData = [];
    try {
      const cached = localStorage.getItem('resqai_dams_real_v2');
      if (cached) {
        damsData = JSON.parse(cached);
      } else {
        damsData = tnDamData;
      }
    } catch (e) {
      damsData = tnDamData;
    }

    damsData.forEach((dam) => {
      const fillPct = ((dam.currentLevel / dam.fullReservoirLevel) * 100);
      const color = fillPct >= 75 ? '#ef4444' : fillPct >= 50 ? '#eab308' : '#06b6d4';

      const icon = leafletLib.divIcon({
        className: 'dam-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #0f172a;
            border: 2px solid ${color};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            box-shadow: 0 0 12px ${color}40;
            font-size: 16px;
            font-weight: bold;
          ">
            💧
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = leafletLib.marker([dam.latitude, dam.longitude], { icon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 220px; background: #1e293b; padding: 12px; border-radius: 8px; border: 2px solid ${color};">
          <strong style="font-size: 14px; color: #ffffff; display: block; margin-bottom: 8px;">💧 ${dam.name}</strong>
          <div style="color: #e2e8f0; font-size: 12px; line-height: 1.8;">
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">River:</strong> <span style="color: #22d3ee;">${dam.river}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Current Level:</strong> <span style="color: ${color}; font-weight: bold;">${dam.currentLevel} ft</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Full Level:</strong> <span style="color: #94a3b8;">${dam.fullReservoirLevel} ft</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #ffffff;">Fill:</strong> <span style="color: ${color}; font-weight: bold; font-size: 14px;">${fillPct.toFixed(1)}%</span></div>
            <div><strong style="color: #ffffff;">Status:</strong> ${fillPct >= 75 ? '<span style="color: #ef4444;">🔴 High</span>' : fillPct >= 50 ? '<span style="color: #eab308;">🟡 Normal</span>' : '<span style="color: #06b6d4;">🔵 Low</span>'}</div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedEntity({ type: 'dam', data: { ...dam, lat: dam.latitude, lng: dam.longitude } });
      });
    });
  }, [map, leafletLib, showDams]);

  // Live Rain Radar Layer (RainViewer Doppler overlay)
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.radar) return;
    const group = layerGroupsRef.current.radar;
    group.clearLayers();

    if (!showRadar) return;

    fetchRainViewerRadarInfo().then((info) => {
      if (info?.success && info.tileUrlTemplate) {
        setRadarTime(info.formattedTime);
        const radarTileLayer = leafletLib.tileLayer(info.tileUrlTemplate, {
          opacity: 0.65,
          zIndex: 300,
          maxZoom: 18,
        });
        radarTileLayer.addTo(group);
      }
    });
  }, [map, leafletLib, showRadar]);

  // Live Seismic Activity Layer (USGS Feed)
  useEffect(() => {
    if (!map || !leafletLib || !layerGroupsRef.current.seismic) return;
    const group = layerGroupsRef.current.seismic;
    group.clearLayers();

    if (!showSeismic) return;

    fetchLiveSeismicTelemetry().then((res) => {
      if (res?.regional) {
        setLiveEarthquakes(res.regional);
        res.regional.forEach((eq) => {
          if (!eq.lat || !eq.lng) return;
          const mag = eq.magnitude || 3.0;
          const color = mag >= 4.5 ? '#ef4444' : '#f59e0b';
          const size = Math.min(38, Math.max(26, Math.round(mag * 7.5)));

          const icon = leafletLib.divIcon({
            className: 'seismic-marker',
            html: `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background: rgba(15, 23, 42, 0.9);
                border: 2px solid ${color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 10px ${color}80;
                font-family: monospace;
                font-weight: bold;
                font-size: 11px;
                color: ${color};
              ">
                M${mag}
              </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const marker = leafletLib.marker([eq.lat, eq.lng], { icon }).addTo(group);
          marker.bindPopup(`
            <div style="font-family: Inter, sans-serif; min-width: 220px; background: #0f172a; padding: 12px; border-radius: 8px; border: 2px solid ${color}; color: #fff;">
              <strong style="color: ${color}; font-size: 13px; display: block; margin-bottom: 6px;">🌍 USGS Live Seismic Event</strong>
              <div style="font-size: 12px; line-height: 1.6;">
                <div><strong>Magnitude:</strong> ${eq.magnitude}</div>
                <div><strong>Location:</strong> ${eq.place}</div>
                <div><strong>Depth:</strong> ${eq.depth} km</div>
                <div><strong>Distance from TN:</strong> ${eq.distFromTN} km</div>
                <div><strong>Time:</strong> ${new Date(eq.time).toLocaleTimeString()}</div>
              </div>
            </div>
          `);

          marker.on('click', () => {
            setSelectedEntity({
              type: 'seismic',
              data: {
                name: `USGS M${eq.magnitude} Epicenter`,
                areaName: eq.place,
                lat: eq.lat,
                lng: eq.lng,
                depth: eq.depth,
                distFromTN: eq.distFromTN,
              },
            });
          });
        });
      }
    });
  }, [map, leafletLib, showSeismic]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Global Location Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Map className="h-7 w-7 text-blue-400" />
            Tactical GIS & Proximity Analyzer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-Time GPS Location Tracking, Global Geocoding & Emergency Reach Analysis
          </p>
        </div>

        {/* Live Location & Manual Search Tool */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Manual Search Input with Quick Chips */}
          <div className="flex flex-col gap-1.5 w-full sm:w-96">
            <div className="relative w-full">
              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white shadow-inner">
                <Search className="h-4 w-4 text-cyan-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type location (e.g. Madurai, Salem, Coimbatore)..."
                  className="bg-transparent border-none text-white focus:outline-none w-full placeholder-slate-400 text-xs pl-1"
                />
                {isSearching && (
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                {searchQuery && !isSearching && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white ml-1">
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdown search results */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800 text-xs">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectLocation(item)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 transition-colors flex items-start gap-2 text-slate-200 group"
                    >
                      <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                      <div className="truncate">
                        <p className="font-semibold text-white group-hover:text-cyan-300">{item.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick City Search Chips */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-500 font-mono font-bold mr-1">Quick:</span>
              {['Madurai', 'Chennai', 'Coimbatore', 'Cuddalore', 'Salem', 'Trichy'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchQuery(city);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800/90 hover:bg-blue-600/30 text-[11px] text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Detect User Live Location Button */}
          <button
            onClick={() => {
              setAutoFollowGps(true);
              detectUserLocation();
            }}
            disabled={isDetectingLocation}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 transition-all self-start sm:self-center"
            title="Detect real-time GPS position"
          >
            <Crosshair className={`h-4 w-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Detecting GPS...' : 'Detect My Location'}</span>
          </button>
        </div>
      </div>

      {/* Layer Controls & GPS Follow Status Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold px-2 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-400" /> Layers:
          </span>

          <button
            onClick={() => setShowDisasters(!showDisasters)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              showDisasters
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🔥 Disasters ({disasters.length})
          </button>

          <button
            onClick={() => setShowTeams(!showTeams)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              showTeams
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🚁 Teams ({teams.filter((t) => t.status === 'deployed').length})
          </button>

          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              showHospitals
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🏥 Hospitals ({hospitals.length})
          </button>

          <button
            onClick={() => setShowDams(!showDams)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              showDams
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            💧 Dams (18)
          </button>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              showZones
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            📍 Monitored Sectors
          </button>

          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              showRadar
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700'
            }`}
            title="Toggle Live Rain Radar from RainViewer"
          >
            <span className="text-xs">🌧️ Live Radar</span>
            {radarTime && <span className="text-[10px] text-cyan-200">({radarTime})</span>}
          </button>

          <button
            onClick={() => setShowSeismic(!showSeismic)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              showSeismic
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle USGS Real-Time Earthquakes"
          >
            <span className="text-xs">🌍 Live USGS</span>
            {liveEarthquakes.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-bold">
                {liveEarthquakes.length}
              </span>
            )}
          </button>
        </div>

        {/* GPS Auto-Follow Status & Origin Pill */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const next = !autoFollowGps;
              setAutoFollowGps(next);
              if (next && map && userLocation?.lat) {
                map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });
              }
            }}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
              autoFollowGps
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
            title={autoFollowGps ? 'Auto-centering on your GPS is active. Click to pause and freely explore map.' : 'Auto-centering is paused. Click to recenter on your GPS.'}
          >
            <span className={`w-2 h-2 rounded-full ${autoFollowGps ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{autoFollowGps ? 'GPS Auto-Follow: ON' : 'Auto-Follow: PAUSED (Free Map)'}</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
            <span className="text-slate-500">Origin:</span>
            <span className="font-semibold text-white truncate max-w-[180px]">{userLocation.name}</span>
          </div>
        </div>
      </div>

      {/* ── STATEWIDE TAMIL NADU & REGIONAL QUICK NAVIGATION TOOLBAR ────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-slate-400 font-bold font-mono text-[11px] whitespace-nowrap flex items-center gap-1">
          <Navigation className="h-3 w-3 text-cyan-400" /> Statewide Quick Jump:
        </span>
        
        <button
          onClick={() => {
            setAutoFollowGps(false);
            if (map) map.flyTo([11.05, 78.65], 7, { duration: 1.2 });
          }}
          className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/50 font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-all"
        >
          🗺️ Statewide Tamil Nadu
        </button>

        <button
          onClick={() => {
            setAutoFollowGps(true);
            if (userLocation?.lat) {
              handleSelectLocation({
                id: 'quick-gps',
                name: userLocation.specificArea ? `${userLocation.specificArea}, ${userLocation.city || userLocation.name}` : userLocation.name || 'My Command Base',
                lat: userLocation.lat,
                lng: userLocation.lng,
              });
              if (map) map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });
            }
          }}
          className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            autoFollowGps
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
          }`}
        >
          <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
          <span>My GPS Position</span>
        </button>

        <button
          onClick={() => {
            handleSelectLocation({
              id: 'quick-madurai',
              name: 'Madurai, Tamil Nadu',
              lat: 9.9252,
              lng: 78.1198,
            });
            if (map) map.flyTo([9.9252, 78.1198], 11, { duration: 1.2 });
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1 whitespace-nowrap transition-all"
        >
          📍 Madurai &amp; South
        </button>

        <button
          onClick={() => {
            handleSelectLocation({
              id: 'quick-chennai',
              name: 'Chennai Central & OMR, Tamil Nadu',
              lat: 12.9500,
              lng: 80.2200,
            });
            if (map) map.flyTo([12.9500, 80.2200], 11, { duration: 1.2 });
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1 whitespace-nowrap transition-all"
        >
          📍 Chennai / OMR
        </button>

        <button
          onClick={() => {
            handleSelectLocation({
              id: 'quick-coimbatore',
              name: 'Coimbatore, Tamil Nadu',
              lat: 11.0168,
              lng: 76.9558,
            });
            if (map) map.flyTo([11.0168, 76.9558], 11, { duration: 1.2 });
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1 whitespace-nowrap transition-all"
        >
          📍 Coimbatore &amp; West
        </button>

        <button
          onClick={() => {
            handleSelectLocation({
              id: 'quick-trichy',
              name: 'Tiruchirappalli (Trichy), Tamil Nadu',
              lat: 10.7905,
              lng: 78.7047,
            });
            if (map) map.flyTo([10.7905, 78.7047], 11, { duration: 1.2 });
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1 whitespace-nowrap transition-all"
        >
          📍 Trichy &amp; Central
        </button>

        <button
          onClick={() => {
            handleSelectLocation({
              id: 'quick-cuddalore',
              name: 'Cuddalore Coastal Port, Tamil Nadu',
              lat: 11.7550,
              lng: 79.7750,
            });
            if (map) map.flyTo([11.7550, 79.7750], 11, { duration: 1.2 });
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1 whitespace-nowrap transition-all"
        >
          📍 Cuddalore Coastal
        </button>

        <button
          onClick={() => {
            handleSelectLocation({
              id: 'quick-salem',
              name: 'Salem, Tamil Nadu',
              lat: 11.6643,
              lng: 78.1460,
            });
            if (map) map.flyTo([11.6643, 78.1460], 11, { duration: 1.2 });
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1 whitespace-nowrap transition-all"
        >
          📍 Salem &amp; North
        </button>
      </div>

      {/* Main Map & Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue-400" />
              Real-Time GIS Command Radar
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-[10px] text-green-400 font-medium">LIVE TELEMETRY</span>
            </div>
          </div>

          <div
            id="map-container"
            className="w-full h-[550px] rounded-xl overflow-hidden border-2 border-slate-700/50 relative"
            style={{ zIndex: 10, touchAction: 'pan-x pan-y' }}
          />

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-5 flex-wrap text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
              <span>You / Command Base</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-white animate-pulse" />
              <span>Active Hazard Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span>Medical Facility</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-cyan-500 border border-white" />
              <span>Reservoir / Dam</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-purple-600 border border-white" />
              <span>Deployed Rescue Squad</span>
            </div>
          </div>
        </div>

        {/* Tactical Information & Location Analysis Side Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Location Risk Analysis Card (when a location is searched) */}
          {locationAnalysis && (
            <div className="glass-card p-5 border-l-4 border-l-blue-500 animate-slide-up bg-blue-500/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                      Location Analysis Report
                    </span>
                    <h4 className="text-base font-bold text-white">{locationAnalysis.locationName}</h4>
                  </div>
                </div>
                <button
                  onClick={() => setLocationAnalysis(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Risk Level Badge & Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Risk Assessment</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-black text-white">{locationAnalysis.calculatedRisk}%</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        locationAnalysis.alertLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300'
                          : locationAnalysis.alertLevel === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {locationAnalysis.alertLevel}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Closest Hospital</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1 truncate">
                    {locationAnalysis.nearestHospital ? locationAnalysis.nearestHospital.name : 'None in range'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {locationAnalysis.nearestHospital ? `${locationAnalysis.nearestHospital.distanceKm} km · ETA ${locationAnalysis.nearestHospital.transitEta}` : ''}
                  </p>
                </div>
              </div>

              {/* ── REAL-TIME WEATHER & METEOROLOGICAL TELEMETRY HUD ────────── */}
              {locationAnalysis.weather && (
                <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-cyan-950/30 border border-cyan-500/30 shadow-lg">
                  {/* Weather Header: Time & Condition */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{locationAnalysis.weather.conditionIcon || '⛅'}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {locationAnalysis.weather.condition || 'Partly Cloudy'}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {locationAnalysis.weather.isLive ? 'LIVE MET' : 'SIMULATED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Feels like <span className="text-slate-200 font-semibold">{locationAnalysis.weather.feelsLikeC}</span>
                        </p>
                      </div>
                    </div>

                    {/* Local Time for Searched City */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-cyan-400 justify-end">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono font-black text-xs">
                          {locationAnalysis.weather.timeStr}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {locationAnalysis.weather.dateStr}
                      </span>
                    </div>
                  </div>

                  {/* 4 Weather Pillars: Temperature, Rain %, Wind Speed, Humidity */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {/* 1. Temperature */}
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Thermometer className="h-3 w-3 text-amber-400" />
                        <span>Temperature</span>
                      </div>
                      <div className="mt-1 font-black text-sm text-white font-mono">
                        {locationAnalysis.weather.temperatureC}
                      </div>
                      <span className="text-[9px] text-amber-300/80 block truncate font-mono">
                        Ambient Air
                      </span>
                    </div>

                    {/* 2. Rain Percentage */}
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <CloudRain className="h-3 w-3 text-blue-400" />
                        <span>Rain Chance</span>
                      </div>
                      <div className="mt-1 font-black text-sm text-blue-400 font-mono">
                        {locationAnalysis.weather.rainPercentageText}
                      </div>
                      <span className="text-[9px] text-slate-400 block truncate font-mono">
                        {locationAnalysis.weather.precipitationMm}
                      </span>
                    </div>

                    {/* 3. Wind Speed */}
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Wind className="h-3 w-3 text-cyan-400" />
                        <span>Wind Velocity</span>
                      </div>
                      <div className="mt-1 font-black text-sm text-cyan-300 font-mono">
                        {locationAnalysis.weather.windSpeedText}
                      </div>
                      <span className="text-[9px] text-slate-400 block truncate font-mono">
                        {locationAnalysis.weather.windDirection} ({locationAnalysis.weather.windDirectionDeg || 0}°)
                      </span>
                    </div>

                    {/* 4. Humidity */}
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Droplets className="h-3 w-3 text-teal-400" />
                        <span>Humidity</span>
                      </div>
                      <div className="mt-1 font-black text-sm text-teal-300 font-mono">
                        {locationAnalysis.weather.humidityText}
                      </div>
                      <span className="text-[9px] text-slate-400 block truncate font-mono">
                        Relative Dew
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Nearby Hospitals List for searched location */}
              <div>
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  Hospitals in Reach from {locationAnalysis.locationName}:
                </h5>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                  {(locationAnalysis.hospitalsInReach || locationAnalysis.backupHospitals || []).slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">{h.name}</p>
                        <p className="text-[10px] text-slate-400">{h.type}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{h.distanceKm} km</span>
                        <p className="text-[10px] text-slate-500">{h.transitEta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Disasters Quick Ticker */}
          {disasters.filter((d) => d.status !== 'completed').length > 0 && (
            <div className="glass-card p-5 border-l-4 border-l-red-500 bg-red-500/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  Active Incident Markers ({disasters.filter((d) => d.status !== 'completed').length})
                </h4>
                <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  Alert
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {disasters.filter((d) => d.status !== 'completed').map((d) => {
                  const statusColor = d.status === 'assigned' ? 'text-blue-400' : 'text-red-400';
                  const borderColor = d.status === 'assigned' ? 'border-blue-500/20 hover:border-blue-500' : 'border-red-500/20 hover:border-red-500';
                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        setAutoFollowGps(false);
                        setSelectedEntity({ type: 'disaster', data: d });
                        if (map) map.flyTo([d.lat, d.lng], 12);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border ${borderColor} cursor-pointer transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{disasterIcons[d.type] || '⚠️'}</span>
                        <div>
                          <p className="text-xs font-semibold text-white">{d.areaName}</p>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {d.type} · {d.status === 'assigned' ? `Team: ${d.assignedTeamName}` : `Severity: ${d.severity}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold ${statusColor}`}>{d.riskPercent}%</span>
                        <p className={`text-[10px] font-bold uppercase ${statusColor}`}>{d.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Entity Details */}
          {selectedEntity && (
            <div className="glass-card p-5 border-l-4 border-l-blue-500 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {selectedEntity.type} Information
                </span>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {selectedEntity.type === 'hospital' && (
                <div className="space-y-2 text-xs">
                  <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                    🏥 {selectedEntity.data.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-slate-400">
                    <div>{distanceOrigin?.isDisaster ? 'From disaster' : 'Distance'}: <strong className="text-emerald-400">{selectedEntity.data.distance} km</strong></div>
                    <div>Transit ETA: <strong className="text-white">{selectedEntity.data.transitEta || '15 mins'}</strong></div>
                    <div>Ambulances: <strong className="text-white">{selectedEntity.data.ambulances} Available</strong></div>
                    <div>Services: <strong className="text-white">{selectedEntity.data.emergency ? '24/7 Trauma' : 'General'}</strong></div>
                  </div>
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedEntity.data.lat},${selectedEntity.data.lng}`,
                        '_blank'
                      );
                    }}
                    className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Navigate to Hospital
                  </button>
                </div>
              )}

              {selectedEntity.type === 'disaster' && (
                <div className="space-y-2 text-xs">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {disasterIcons[selectedEntity.data.type]} {selectedEntity.data.type?.toUpperCase()} in {selectedEntity.data.areaName}
                  </h4>
                  <p className="text-slate-300">{selectedEntity.data.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-slate-400">
                    <div>Status: <strong className={`capitalize ${selectedEntity.data.status === 'assigned' ? 'text-blue-400' : selectedEntity.data.status === 'completed' ? 'text-emerald-400' : 'text-red-400'}`}>{selectedEntity.data.status}</strong></div>
                    <div>Risk: <strong className="text-red-400">{selectedEntity.data.riskPercent}%</strong></div>
                    <div>Severity: <strong className="text-red-400 capitalize">{selectedEntity.data.severity}</strong></div>
                    {selectedEntity.data.assignedTeamName && (
                      <div>Team: <strong className="text-blue-400">{selectedEntity.data.assignedTeamName}</strong></div>
                    )}
                  </div>
                  {selectedEntity.data.status === 'active' && (
                    <button
                      onClick={() => autoDeployTeam(selectedEntity.data.areaName, selectedEntity.data.type)}
                      className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-xs"
                    >
                      🚁 Dispatch Response Squad
                    </button>
                  )}
                </div>
              )}

              {selectedEntity.type === 'area' && (
                <div className="space-y-2 text-xs">
                  <h4 className="text-base font-bold text-white">📍 {selectedEntity.data.name}</h4>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-slate-400">
                    <div>Priority: <strong style={{ color: priorityColors[selectedEntity.data.priority] }}>{selectedEntity.data.priority}</strong></div>
                    <div>Risk Level: <strong className="text-white">{selectedEntity.data.riskPercent}%</strong></div>
                    <div>{distanceOrigin?.isDisaster ? 'From disaster' : 'Distance'}: <strong className="text-emerald-400">{selectedEntity.data.distanceFromUserKm || 'N/A'} km</strong></div>
                  </div>
                </div>
              )}

              {/* Auto-Fetched Real-Time Weather & Meteorological Telemetry for Viewed Entity */}
              {selectedEntity.weather && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 border border-cyan-500/30 shadow-md">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl select-none">{selectedEntity.weather.conditionIcon || '⛅'}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {selectedEntity.weather.condition || 'Clear Sky'}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            AUTO WEATHER
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Feels {selectedEntity.weather.feelsLikeC} · 🕒 {selectedEntity.weather.timeStr}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                        <Thermometer className="h-3 w-3 text-amber-400" />
                        <span>Temp</span>
                      </div>
                      <div className="mt-1 font-black text-white text-xs">
                        {selectedEntity.weather.temperatureC}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                        <CloudRain className="h-3 w-3 text-blue-400" />
                        <span>Rain %</span>
                      </div>
                      <div className="mt-1 font-black text-blue-400 text-xs">
                        {selectedEntity.weather.rainPercentageText}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                        <Wind className="h-3 w-3 text-cyan-400" />
                        <span>Wind</span>
                      </div>
                      <div className="mt-1 font-black text-cyan-300 text-xs">
                        {selectedEntity.weather.windSpeedText}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                        <Droplets className="h-3 w-3 text-teal-400" />
                        <span>Humid</span>
                      </div>
                      <div className="mt-1 font-black text-teal-300 text-xs">
                        {selectedEntity.weather.humidityText}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Default Command Base Origin Weather (when no specific search or entity is selected) */}
          {!locationAnalysis && !selectedEntity && userLocationWeather && (
            <div className="glass-card p-4 border-l-4 border-l-cyan-500 bg-cyan-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl select-none">{userLocationWeather.conditionIcon || '⛅'}</span>
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                      Base Origin Weather Telemetry
                    </span>
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                      {userLocation.specificArea || userLocation.name || 'Current Command Base'}
                    </h4>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
                  AUTO LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono mt-2.5">
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Temp</span>
                  <span className="text-amber-300 font-bold text-xs">{userLocationWeather.temperatureC}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Rain %</span>
                  <span className="text-blue-400 font-bold text-xs">{userLocationWeather.rainPercentageText}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Wind</span>
                  <span className="text-cyan-300 font-bold text-xs">{userLocationWeather.windSpeedText}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Local Time</span>
                  <span className="text-white font-bold text-[11px] truncate block">{userLocationWeather.timeStr}</span>
                </div>
              </div>
            </div>
          )}

          {/* Regional Sectors Directory with distances */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Regional Sector Distance Matrix
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {liveAreas.length} Sectors
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {liveAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => {
                    setAutoFollowGps(false);
                    setSelectedEntity({ type: 'area', data: area });
                    if (map) {
                      map.flyTo([area.lat, area.lng], 11);
                    }
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 transition-colors border border-slate-700/30 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: priorityColors[area.priority] || '#3b82f6' }} />
                    <div>
                      <p className="text-xs font-semibold text-white">{area.name}</p>
                      <p className="text-[10px] text-slate-400">{distanceOrigin?.isDisaster ? 'From disaster' : 'Distance'}: {area.distanceFromUserKm || 'N/A'} km</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${priorityColors[area.priority]}20`,
                        color: priorityColors[area.priority],
                      }}
                    >
                      {area.riskPercent}% · {area.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }

        @keyframes radarPing {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          color: #0f172a;
        }

        #map-container .leaflet-tile-pane {
          filter: brightness(0.72) contrast(1.15) saturate(0.85);
        }
      `}</style>
    </div>
  );
}

export default MapView;
