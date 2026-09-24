import { useState } from 'react';
import { Zap, MapPin, AlertTriangle, Droplets, Wind, Activity, Mountain, Plus, Trash2, Play, Navigation, Hospital, X, Clock, Ambulance, Smartphone, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { monitoredAreas, hospitals } from '../data/mockData';
import { sendSOSAlert } from '../services/notificationService';

const disasterTypes = [
  { id: 'flood', label: 'Flood', icon: Droplets, color: '#3b82f6', emoji: '🌊' },
  { id: 'cyclone', label: 'Cyclone', icon: Wind, color: '#8b5cf6', emoji: '🌀' },
  { id: 'earthquake', label: 'Earthquake', icon: Activity, color: '#f59e0b', emoji: '🌍' },
];

const severityLevels = [
  { value: 'low', label: 'Low', color: '#22c55e', range: '0-25%' },
  { value: 'medium', label: 'Medium', color: '#eab308', range: '26-50%' },
  { value: 'high', label: 'High', color: '#f97316', range: '51-75%' },
  { value: 'critical', label: 'Critical', color: '#ef4444', range: '76-100%' },
];

function DemoControls() {
  const { disasters, addDisaster, removeDisaster, completeDisaster, clearAllDisasters, addSOSBeacon, dispatchAmbulance } = useApp();
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [formData, setFormData] = useState({
    location: 'Cuddalore', // Default location so button works immediately
    customLat: '',
    customLng: '',
    disasterType: 'flood',
    severity: 'high',
    riskPercent: 76,
    description: '',
  });

  const handleCreateDisaster = () => {
    console.log('🔥 TRIGGER DISASTER clicked!', formData);

    if (!formData.location && (!formData.customLat || !formData.customLng)) {
      showErrorNotification('Please select a location or enter custom coordinates');
      return;
    }

    // Find selected area or use custom coordinates
    let area = monitoredAreas.find(a => a.name === formData.location);
    let lat, lng, areaName;

    if (area) {
      lat = area.lat;
      lng = area.lng;
      areaName = area.name;
    } else {
      lat = parseFloat(formData.customLat);
      lng = parseFloat(formData.customLng);
      areaName = `Custom Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    }

    const disaster = {
      id: Date.now(),
      areaName,
      lat,
      lng,
      type: formData.disasterType,
      severity: formData.severity,
      riskPercent: formData.riskPercent,
      description: formData.description || `${formData.disasterType} emergency`,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    console.log('✅ Disaster created:', disaster);
    addDisaster(disaster); // Add to global state

    // Show success notification
    showNotification(disaster);

    // Reset description only
    setFormData({
      ...formData,
      description: '',
    });
  };

  const showNotification = (disaster) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-6 z-50 animate-slide-up';
    notification.innerHTML = `
      <div class="glass-card p-4 border-l-4 border-l-red-500 bg-red-500/10 shadow-xl max-w-md">
        <div class="flex items-start gap-3">
          <div class="text-2xl">${disasterTypes.find(d => d.id === disaster.type)?.emoji}</div>
          <div>
            <h4 class="text-sm font-bold text-white mb-1">⚠️ DISASTER TRIGGERED!</h4>
            <p class="text-xs text-slate-300">${disaster.type.toUpperCase()} in ${disaster.areaName}</p>
            <p class="text-xs text-red-400 font-semibold mt-1">Risk: ${disaster.riskPercent}%</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  const showErrorNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-6 z-50 animate-slide-up';
    notification.innerHTML = `
      <div class="glass-card p-4 border-l-4 border-l-yellow-500 bg-yellow-500/10 shadow-xl max-w-md">
        <div class="flex items-start gap-3">
          <div class="text-2xl">⚠️</div>
          <div>
            <h4 class="text-sm font-bold text-yellow-400 mb-1">Validation Error</h4>
            <p class="text-xs text-slate-300">${message}</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  const handleDeleteDisaster = (id) => {
    console.log('🗑️ Deleting disaster:', id);
    removeDisaster(id);
  };

  const handleClearAll = () => {
    console.log('🧹 Clear All clicked');
    setShowClearConfirm(true);
  };

  const handleSimulateRealtime = () => {
    console.log('▶️ SIMULATE REAL-TIME clicked!');

    // Create a realistic disaster scenario
    const scenarios = [
      {
        location: 'Cuddalore',
        disasterType: 'flood',
        severity: 'critical',
        riskPercent: 85,
        description: 'Heavy rainfall causing severe flooding. Water level rising rapidly.',
      },
      {
        location: 'Chidambaram',
        disasterType: 'cyclone',
        severity: 'high',
        riskPercent: 68,
        description: 'Cyclone approaching from Bay of Bengal. Wind speed 75 km/h.',
      },
    ];

    console.log('🎬 Creating 2 disasters with 2-second delay...');

    scenarios.forEach((scenario, index) => {
      setTimeout(() => {
        const area = monitoredAreas.find(a => a.name === scenario.location);
        const disaster = {
          id: Date.now() + index,
          areaName: area.name,
          lat: area.lat,
          lng: area.lng,
          type: scenario.disasterType,
          severity: scenario.severity,
          riskPercent: scenario.riskPercent,
          description: scenario.description,
          timestamp: new Date().toISOString(),
          status: 'active',
        };
        console.log(`✅ Scenario ${index + 1} created:`, disaster);
        addDisaster(disaster);
        showNotification(disaster);
      }, index * 2000);
    });
  };

  const getSeverityFromRisk = (risk) => {
    if (risk >= 76) return 'critical';
    if (risk >= 51) return 'high';
    if (risk >= 26) return 'medium';
    return 'low';
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
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
    return R * c; // Distance in km
  };

  // Format distance for display
  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`; // Show in meters if < 1 km
    }
    return `${km.toFixed(2)} km`;
  };

  // Find nearest hospital and calculate route
  const handleFindRoute = (disaster) => {
    console.log('🚑 Finding nearest hospital for:', disaster);
    setSelectedDisaster(disaster);

    // Calculate distances to all hospitals
    const hospitalsWithDistance = hospitals.map((hospital) => ({
      ...hospital,
      distanceFromDisaster: calculateDistance(
        disaster.lat,
        disaster.lng,
        hospital.lat,
        hospital.lng
      ),
    }));

    // Sort by distance
    hospitalsWithDistance.sort((a, b) => a.distanceFromDisaster - b.distanceFromDisaster);

    // Get top 3 nearest hospitals
    const nearestHospitals = hospitalsWithDistance.slice(0, 3);
    const nearest = nearestHospitals[0];

    // Calculate estimated travel time (assuming 40 km/h average in emergency)
    // Minimum 1 minute for very short distances
    const distanceKm = nearest.distanceFromDisaster;
    const calculatedTime = Math.ceil((distanceKm / 40) * 60);
    const travelTimeMinutes = Math.max(1, calculatedTime);

    // Generate route description
    const direction = getDirection(disaster.lat, disaster.lng, nearest.lat, nearest.lng);

    const route = {
      disaster,
      nearestHospital: nearest,
      alternatives: nearestHospitals.slice(1),
      distance: formatDistance(distanceKm),
      distanceKm: distanceKm, // Keep raw value for calculations
      travelTime: travelTimeMinutes,
      direction,
      routeSteps: generateRouteSteps(disaster, nearest, direction, distanceKm),
    };

    console.log('✅ Route calculated:', route);
    setRouteInfo(route);
    setShowRouteModal(true);
  };

  // Get compass direction between two points
  const getDirection = (lat1, lng1, lat2, lng2) => {
    const dLng = lng2 - lng1;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(((bearing + 360) % 360) / 45) % 8;
    return directions[index];
  };

  // Generate turn-by-turn route steps
  const generateRouteSteps = (disaster, hospital, direction, distanceKm) => {
    const mainRoadDistance = distanceKm * 0.6;
    const formattedRoadDistance = mainRoadDistance < 1
      ? `${Math.round(mainRoadDistance * 1000)} meters`
      : `${mainRoadDistance.toFixed(1)} km`;

    // For very short distances (< 0.5 km), use simplified directions
    if (distanceKm < 0.5) {
      return [
        `Start from ${disaster.areaName} (${disaster.lat.toFixed(3)}, ${disaster.lng.toFixed(3)})`,
        `Hospital is very close - head ${direction}`,
        `Walk or drive approximately ${Math.round(distanceKm * 1000)} meters`,
        `Arrive at ${hospital.name} (${hospital.lat.toFixed(3)}, ${hospital.lng.toFixed(3)})`,
      ];
    }

    return [
      `Start from ${disaster.areaName} (${disaster.lat.toFixed(3)}, ${disaster.lng.toFixed(3)})`,
      `Head ${direction} towards ${hospital.name}`,
      `Continue for ${formattedRoadDistance} on main road`,
      `Turn towards hospital entrance`,
      `Arrive at ${hospital.name} (${hospital.lat.toFixed(3)}, ${hospital.lng.toFixed(3)})`,
    ];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Zap className="h-7 w-7 text-yellow-400" />
          Demo Controls - Manual Disaster Trigger
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Create manual disasters for testing and demonstrations
        </p>
      </div>

      {/* Warning Banner */}
      <div className="glass-card p-4 border-l-4 border-l-yellow-500 bg-yellow-500/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-1">Demo Mode Only</h4>
            <p className="text-xs text-slate-300">
              This is for demonstrations and testing only. In production, disasters are detected automatically from real-time data sources.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSimulateRealtime}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
        >
          <Play className="h-5 w-5" />
          Simulate Real-Time Scenario
        </button>
        {disasters.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
          >
            <Trash2 className="h-5 w-5" />
            Clear All ({disasters.length})
          </button>
        )}
      </div>

      {/* Create Disaster Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-400" />
            Create Manual Disaster
          </h3>

          <div className="space-y-4">
            {/* Location Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Select Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Location --</option>
                {monitoredAreas.map(area => (
                  <option key={area.id} value={area.name}>
                    {area.name} ({area.lat.toFixed(2)}, {area.lng.toFixed(2)})
                  </option>
                ))}
                <option value="custom">Custom Coordinates...</option>
              </select>
            </div>

            {/* Custom Coordinates */}
            {formData.location === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="11.748"
                    value={formData.customLat}
                    onChange={(e) => setFormData({ ...formData, customLat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="79.768"
                    value={formData.customLng}
                    onChange={(e) => setFormData({ ...formData, customLng: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Disaster Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Disaster Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {disasterTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, disasterType: type.id })}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.disasterType === type.id
                          ? 'border-white bg-white/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      style={{ borderColor: formData.disasterType === type.id ? type.color : undefined }}
                    >
                      <span className="text-xl">{type.emoji}</span>
                      <span className="text-sm font-medium text-white">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity & Risk */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Risk Level: {formData.riskPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.riskPercent}
                onChange={(e) => {
                  const risk = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    riskPercent: risk,
                    severity: getSeverityFromRisk(risk),
                  });
                }}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right,
                    #22c55e 0%,
                    #eab308 25%,
                    #f97316 50%,
                    #ef4444 75%,
                    #ef4444 100%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                {severityLevels.map(level => (
                  <span
                    key={level.value}
                    className="text-xs font-medium"
                    style={{ color: formData.severity === level.value ? level.color : '#64748b' }}
                  >
                    {level.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="E.g., Heavy rainfall causing severe flooding..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateDisaster}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <AlertTriangle className="h-6 w-6" />
              TRIGGER DISASTER
            </button>
          </div>
        </div>

        {/* Right: Active Disasters */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Active Demo Disasters ({disasters.length})
          </h3>

          {disasters.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-center">
              <div>
                <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No active disasters</p>
                <p className="text-xs text-slate-600 mt-1">Create one to start testing</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {disasters.map(disaster => {
                const type = disasterTypes.find(d => d.id === disaster.type);
                const severity = severityLevels.find(s => s.value === disaster.severity);
                const statusColors = {
                  active: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/40', label: 'ACTIVE' },
                  assigned: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40', label: 'TEAM ASSIGNED' },
                  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40', label: 'COMPLETED' },
                };
                const sc = statusColors[disaster.status] || statusColors.active;
                return (
                  <div
                    key={disaster.id}
                    className={`p-4 rounded-xl border-l-4 transition-colors ${disaster.status === 'completed' ? 'bg-slate-800/20 opacity-60' : 'bg-slate-800/40 hover:bg-slate-800/60'}`}
                    style={{ borderLeftColor: disaster.status === 'completed' ? '#22c55e' : disaster.status === 'assigned' ? '#3b82f6' : type?.color }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{type?.emoji}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{disaster.areaName}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-400">{type?.label}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sc.bg} ${sc.text} border ${sc.border}`}>
                              {sc.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      {disaster.status !== 'completed' && (
                        <button
                          onClick={() => handleDeleteDisaster(disaster.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-all hover:scale-110 active:scale-90"
                          title="Delete disaster"
                        >
                          <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                        </button>
                      )}
                    </div>

                    {disaster.assignedTeamName && (
                      <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 font-semibold flex items-center gap-1.5">
                        <span>🚁</span> Assigned: {disaster.assignedTeamName}
                      </div>
                    )}

                    {disaster.nearestHospitalName && (
                      <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-300 font-medium flex items-center gap-1.5">
                        <Hospital className="h-3.5 w-3.5" /> Nearest: {disaster.nearestHospitalName} ({disaster.nearestHospitalDistance} km)
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Risk Level:</span>
                        <span className="font-bold" style={{ color: severity?.color }}>
                          {disaster.riskPercent}% ({severity?.label.toUpperCase()})
                        </span>
                      </div>

                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${disaster.riskPercent}%`,
                            backgroundColor: severity?.color,
                          }}
                        />
                      </div>

                      {disaster.description && (
                        <p className="text-xs text-slate-400 mt-2">{disaster.description}</p>
                      )}

                      {disaster.status !== 'completed' && (
                        <>
                          <button
                            onClick={() => handleFindRoute(disaster)}
                            className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                          >
                            <Navigation className="h-4 w-4" />
                            Find Nearest Hospital Route
                          </button>

                          <button
                            onClick={() => completeDisaster(disaster.id)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            Mark as Completed
                          </button>
                        </>
                      )}

                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span>{disaster.lat.toFixed(2)}, {disaster.lng.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(disaster.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CITIZEN WEBHOOK SIMULATOR ── */}
      <div className="glass-card p-6 border-l-4 border-l-orange-500 relative overflow-hidden">
        {/* Background visual flair */}
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full"></div>
        
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <Smartphone className="h-6 w-6 text-orange-400" />
          Citizen Webhook Simulator (SOS)
        </h3>
        <p className="text-sm text-slate-400 mb-6 max-w-2xl">
          Simulate incoming emergency payloads from the public. In production, these buttons represent endpoints that would be triggered automatically by Twilio WhatsApp bots or Telecom USSD gateways.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          
          {/* WhatsApp Simulation */}
          <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-700/60 hover:border-green-500/30 transition-all group shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <MessageSquare className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">WhatsApp Emergency Bot</h4>
                <p className="text-xs text-slate-400">Triggers via +91 98432 79397</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4 h-12">
              Injects a mock webhook payload representing a citizen sharing their live location via the WhatsApp Bot.
            </p>
            <button
              onClick={() => {
                const beacon = {
                  senderName: 'Rajesh K. (WhatsApp)',
                  contact: '+91 98432 79397',
                  areaName: 'Velachery',
                  lat: 12.971,
                  lng: 80.218,
                  type: 'Trapped in Building',
                  message: 'Ground floor flooded, stuck on 2nd floor with elderly parents. Need rescue boat.',
                  peopleCount: 3,
                  severity: 'critical',
                  source: 'WhatsApp',
                };
                addSOSBeacon(beacon);
                sendSOSAlert(beacon);
              }}
              className="w-full px-4 py-3 bg-slate-800 hover:bg-green-600/20 text-green-400 hover:text-green-300 font-semibold rounded-lg border border-slate-700 hover:border-green-500/50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="h-4 w-4" />
              Simulate WhatsApp Payload
            </button>
          </div>

          {/* SMS / USSD Simulation */}
          <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-700/60 hover:border-blue-500/30 transition-all group shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Smartphone className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">SMS / Cell-Tower Fallback</h4>
                <p className="text-xs text-slate-400">Triggers via Telecom APIs</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4 h-12">
              Injects a mock payload representing an offline SMS triangulated by nearby cell towers during an internet blackout.
            </p>
            <button
              onClick={() => {
                const beacon = {
                  senderName: 'Unknown Civilian (SMS)',
                  contact: '+91 94441 12233',
                  areaName: 'Pallikaranai Marsh',
                  lat: 12.934,
                  lng: 80.212,
                  type: 'Medical Emergency',
                  message: 'DIABETIC SHOCK. NO INSULIN. NO INTERNET.',
                  peopleCount: 1,
                  severity: 'high',
                  source: 'SMS_Gateway',
                };
                addSOSBeacon(beacon);
                sendSOSAlert(beacon);
              }}
              className="w-full px-4 py-3 bg-slate-800 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 font-semibold rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="h-4 w-4" />
              Simulate Triangulated SMS
            </button>
          </div>

        </div>

      </div>

      {/* Route Modal */}
      {showRouteModal && routeInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Navigation className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Emergency Route to Hospital</h3>
                  <p className="text-sm text-slate-400">Fastest route for {routeInfo.disaster.areaName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRouteModal(false)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
              >
                <X className="h-6 w-6 text-slate-400 hover:text-red-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 border-l-4 border-l-green-500">
                  <div className="flex items-center gap-3">
                    <Hospital className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Distance</p>
                      <p className="text-2xl font-bold text-white">{routeInfo.distance}</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Est. Time</p>
                      <p className="text-2xl font-bold text-white">{routeInfo.travelTime} min</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-purple-500">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Direction</p>
                      <p className="text-xl font-bold text-white">{routeInfo.direction}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nearest Hospital Details */}
              <div className="glass-card p-6 border-l-4 border-l-green-500">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Hospital className="h-5 w-5 text-green-400" />
                  Nearest Hospital (Recommended)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xl font-bold text-green-400 mb-2">{routeInfo.nearestHospital.name}</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>{routeInfo.nearestHospital.lat.toFixed(3)}, {routeInfo.nearestHospital.lng.toFixed(3)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-semibold">{routeInfo.nearestHospital.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-slate-500">Status:</span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-semibold uppercase">
                          {routeInfo.nearestHospital.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Hospital className="h-5 w-5 text-blue-400" />
                        <span className="text-sm text-slate-400">Facility Status</span>
                      </div>
                      <span className="text-lg font-bold text-white capitalize">
                        {routeInfo.nearestHospital.status || 'operational'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Ambulance className="h-5 w-5 text-red-400" />
                        <span className="text-sm text-slate-400">Ambulances</span>
                      </div>
                      <span className="text-lg font-bold text-white">
                        {routeInfo.nearestHospital.ambulances} available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Steps */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-400" />
                  Turn-by-Turn Directions
                </h4>
                <div className="space-y-3">
                  {routeInfo.routeSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-400">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Hospitals */}
              {routeInfo.alternatives.length > 0 && (
                <div className="glass-card p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Hospital className="h-5 w-5 text-slate-400" />
                    Alternative Hospitals
                  </h4>
                  <div className="space-y-3">
                    {routeInfo.alternatives.map((hospital, index) => {
                      const altTravelTime = Math.max(1, Math.ceil((hospital.distanceFromDisaster / 40) * 60));
                      return (
                        <div key={hospital.id} className="p-4 bg-slate-800/40 rounded-lg hover:bg-slate-800/60 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-white">{hospital.name}</h5>
                              <p className="text-xs text-slate-400">{hospital.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-300">{formatDistance(hospital.distanceFromDisaster)}</p>
                              <p className="text-xs text-slate-500">{altTravelTime} min</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>🏥 {hospital.type || 'Emergency Trauma'}</span>
                            <span>🚑 {hospital.ambulances} ambulances</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    dispatchAmbulance(
                      routeInfo.nearestHospital.id,
                      routeInfo.disaster.areaName,
                      routeInfo.disaster.id
                    );
                    setShowRouteModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Ambulance className="h-5 w-5" />
                  Dispatch Ambulance
                </button>
                <button
                  onClick={() => setShowRouteModal(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear All Confirmation Modal ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-fade-in"></div>
          
          <div className="relative glass-card p-0 bg-slate-900/95 shadow-[0_0_50px_-12px_rgba(225,29,72,0.3)] max-w-md w-full rounded-2xl border border-rose-900/40 overflow-hidden animate-slide-up">
            
            {/* Header pattern & gradient */}
            <div className="relative h-28 bg-gradient-to-br from-rose-950 to-slate-950 flex items-center justify-center border-b border-rose-900/50">
              <div className="absolute inset-0 cyber-grid opacity-20"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-600/20 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/20 blur-3xl rounded-full"></div>
              
              <div className="relative z-10 w-20 h-20 bg-slate-950 border-2 border-rose-500/50 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.4)] mt-16">
                <Trash2 className="w-9 h-9 text-rose-500 animate-pulse" />
              </div>
            </div>

            <div className="p-8 pt-14 text-center relative z-10">
              <h3 className="text-xl font-black text-white mb-2 tracking-wide uppercase">Wipe Operations System?</h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                This will permanently erase all active <span className="text-rose-400 font-bold">demo disasters</span> from the tactical grid. The dashboard and monitoring maps will be completely reset.
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700 hover:border-slate-500 active:scale-95 shadow-sm"
                >
                  ABORT
                </button>
                <button
                  onClick={() => {
                    clearAllDisasters();
                    setShowClearConfirm(false);
                    
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-24 right-6 z-[100] animate-slide-up';
                    notification.innerHTML = `
                      <div class="glass-card p-4 border-l-4 border-l-rose-500 bg-rose-950/80 shadow-2xl shadow-rose-500/20 backdrop-blur-xl max-w-md rounded-xl border border-slate-700">
                        <div class="flex items-start gap-3">
                          <div class="text-2xl mt-1">🧹</div>
                          <div>
                            <h4 class="text-sm font-bold text-rose-400 mb-1 tracking-wide">SYSTEM CLEARED</h4>
                            <p class="text-xs text-slate-300">All demo disasters have been wiped.</p>
                          </div>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(notification);
                    setTimeout(() => {
                      notification.style.opacity = '0';
                      notification.style.transition = 'opacity 0.5s ease';
                      setTimeout(() => notification.remove(), 500);
                    }, 3000);
                  }}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-600 text-white font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all active:scale-95"
                >
                  CONFIRM WIPE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoControls;
