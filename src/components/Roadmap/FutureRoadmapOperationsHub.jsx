import { useState } from 'react';
import {
  Radar,
  Radio,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Eye,
  Camera,
  Compass,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  SATELLITE_CONSTELLATIONS,
  SATELLITE_FLOOD_SECTORS,
} from '../../services/satelliteFloodService';
import { DRONE_SQUADRONS } from '../../services/droneFleetService';
import {
  HISTORICAL_DELUGE_DATASETS,
  runPredictiveFloodSimulation,
} from '../../services/predictiveFloodService';

export default function FutureRoadmapOperationsHub() {
  const [activeTab, setActiveTab] = useState('satellite');

  // Drone State
  const [selectedDrone, setSelectedDrone] = useState(DRONE_SQUADRONS[0]);
  const [flirMode, setFlirMode] = useState(true);

  // ML Simulation State
  const [selectedDatasetId, setSelectedDatasetId] = useState('chennai_2015');
  const [rainfallRate, setRainfallRate] = useState(65); // mm/hr
  const [reservoirCapacity, setReservoirCapacity] = useState(82); // %
  const [soilSaturation, setSoilSaturation] = useState(88); // %
  const [simResults, setSimResults] = useState(() =>
    runPredictiveFloodSimulation({
      datasetId: 'chennai_2015',
      rainfallRateMmPerHr: 65,
      reservoirCapacityPct: 82,
      soilSaturationPct: 88,
    })
  );

  const handleRunSimulation = () => {
    const results = runPredictiveFloodSimulation({
      datasetId: selectedDatasetId,
      rainfallRateMmPerHr: rainfallRate,
      reservoirCapacityPct: reservoirCapacity,
      soilSaturationPct: soilSaturation,
    });
    setSimResults(results);
  };

  const selectedDataset = HISTORICAL_DELUGE_DATASETS.find(
    (d) => d.id === selectedDatasetId
  ) || HISTORICAL_DELUGE_DATASETS[0];

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300 font-mono">
              Future Roadmap &amp; Advanced AI Operations
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Phase II Roadmap
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Tactical Space &amp; Aerial Autonomous Defense Operations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Integrated Copernicus SAR Radar, Autonomous Drone FLIR Squadrons, and Machine Learning Deluge Prediction Models.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'satellite'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="h-3.5 w-3.5" />
            <span>SAR Satellite Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('drones')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'drones'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Drone FLIR Vision</span>
          </button>

          <button
            onClick={() => setActiveTab('ml')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ml'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>ML Deluge Predictor</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: SATELLITE IMAGERY & SAR FLOOD RADAR ──────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'satellite' && (
        <div className="space-y-5 animate-fade-in">
          {/* Active Constellations Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SATELLITE_CONSTELLATIONS.map((sat) => (
              <div
                key={sat.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Radar className="h-3.5 w-3.5 text-cyan-400" />
                    {sat.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{sat.agency}</p>
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span>Res: {sat.resolution}</span>
                  <span className="text-cyan-400">{sat.orbitCycle}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Monitored River Basins Extent Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-cyan-400" />
                Active SAR Inundation Sectors (Cloud-Penetrating Radar)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                VV+VH Polarimetric Ratio (&lt; -16 dB Water Threshold)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {SATELLITE_FLOOD_SECTORS.map((sector) => (
                <div
                  key={sector.id}
                  className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{sector.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pass Time: <strong className="text-cyan-300 font-mono">{sector.postFloodPassDate}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                      {sector.inundationPercentage}% EXTENT
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                      <span>Inundated Area: <strong className="text-cyan-400">{sector.inundatedAreaSqKm} km²</strong></span>
                      <span className="text-slate-400">Total: {sector.totalBasinAreaSqKm} km²</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-rose-500 transition-all duration-700"
                        style={{ width: `${sector.inundationPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Pop. Exposed</span>
                      <span className="text-amber-400 font-bold font-mono">
                        {sector.populationExposed.toLocaleString()} civilians
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">SAR Backscatter</span>
                      <span className="text-cyan-400 font-bold font-mono">{sector.sarThresholdDb} dB</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>Optical Cloud Cover: <strong className="text-slate-300">{sector.cloudCoverDuringOptical}</strong></span>
                    <span className="text-emerald-400 font-semibold">✓ SAR Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: AUTONOMOUS DRONE SQUADRONS & FLIR THERMAL ───────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'drones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in items-start">
          {/* Left Column: Drone Selector & Live Telemetry HUD */}
          <div className="lg:col-span-5 space-y-3.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-cyan-400" />
              Active UAV Squadrons On Station
            </span>

            <div className="space-y-2">
              {DRONE_SQUADRONS.map((drone) => (
                <button
                  key={drone.id}
                  onClick={() => setSelectedDrone(drone)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedDrone.id === drone.id
                      ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{drone.callsign}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      LIVE STREAM · {drone.streamFps} FPS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{drone.sector}</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-300">
                    <span>Alt: <strong className="text-cyan-400">{drone.altitudeM}m</strong></span>
                    <span>Speed: <strong className="text-cyan-400">{drone.speedKmh} km/h</strong></span>
                    <span>Bat: <strong className="text-emerald-400">{drone.batteryPct}%</strong></span>
                  </div>
                </button>
              ))}
            </div>

            {/* Flight Avionics HUD */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">GPS FIX:</span>
                <span className="text-cyan-300 font-bold">{selectedDrone.lat.toFixed(4)}° N, {selectedDrone.lng.toFixed(4)}° E</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">UAV Model:</span>
                <span className="text-white">{selectedDrone.model}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Sensor Payload:</span>
                <span className="text-purple-300 font-bold">{selectedDrone.activeSensor}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Live Video Feed & Computer Vision Detection Box */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-white uppercase font-mono">
                  {selectedDrone.callsign} Real-Time Aerial Reconnaissance
                </span>
              </div>
              <button
                onClick={() => setFlirMode(!flirMode)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  flirMode
                    ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {flirMode ? '🌡️ FLIR Thermal LWIR Mode: ON' : '📷 4K Optical Mode'}
              </button>
            </div>

            {/* Simulated Live Viewport */}
            <div
              className={`relative rounded-2xl overflow-hidden border-2 h-72 flex flex-col justify-between p-4 ${
                flirMode
                  ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-purple-500/50 shadow-purple-500/20'
                  : 'bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 border-cyan-500/50 shadow-cyan-500/20'
              }`}
            >
              {/* HUD Overlay Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-40 h-40 border border-cyan-400 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 border border-cyan-400" />
                </div>
              </div>

              {/* Top HUD Telemetry Banner */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
                <span>HDOP: 0.8 · SATELLITES: 19</span>
                <span>SIGNAL: {selectedDrone.signalDbm} dBm</span>
                <span className="text-emerald-400 font-bold">REC ● 00:32:14</span>
              </div>

              {/* AI Object Detection Bounding Boxes */}
              <div className="relative z-10 space-y-2">
                {selectedDrone.detectedObjects.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-2.5 rounded-xl border backdrop-blur-md flex items-center justify-between ${
                      obj.severity === 'critical'
                        ? 'bg-red-950/80 border-red-500/80 text-red-200'
                        : obj.severity === 'warning'
                          ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                          : 'bg-slate-950/80 border-cyan-500/80 text-cyan-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <span className="font-bold text-xs block text-white">{obj.label}</span>
                        <span className="text-[10px] text-slate-300">
                          AI Confidence: <strong>{(obj.conf * 100).toFixed(0)}%</strong> · Status: {obj.status}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/10 font-mono">
                      TARGET IDENTIFIED
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom HUD bar */}
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>HEADING: {selectedDrone.headingDeg}°</span>
                <span>LATENCY: 42ms</span>
                <span className="text-cyan-400">ENCRYPTED AES-256</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: MACHINE LEARNING DELUGE PREDICTOR ───────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ml' && (
        <div className="space-y-5 animate-fade-in">
          {/* Controls & Historical Benchmark Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Select Historical Baseline Benchmark
              </span>

              <div className="grid grid-cols-2 gap-2">
                {HISTORICAL_DELUGE_DATASETS.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      setSelectedDatasetId(ds.id);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedDatasetId === ds.id
                        ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold text-white text-xs block truncate">{ds.title}</span>
                    <span className="text-[10px] text-cyan-400 font-mono block mt-0.5">{ds.historicalRainfall}</span>
                    <span className="text-[10px] text-slate-400 block truncate mt-1">Peak: {ds.peakDischarge}</span>
                  </button>
                ))}
              </div>

              {/* Sliders for Dynamic Simulation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Simulated Precipitation Rate:</span>
                    <span className="text-cyan-400 font-mono">{rainfallRate} mm/hr</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    value={rainfallRate}
                    onChange={(e) => setRainfallRate(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Catchment Reservoir Starting Storage:</span>
                    <span className="text-cyan-400 font-mono">{reservoirCapacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="98"
                    value={reservoirCapacity}
                    onChange={(e) => setReservoirCapacity(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Soil Saturation Moisture Index:</span>
                    <span className="text-cyan-400 font-mono">{soilSaturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={soilSaturation}
                    onChange={(e) => setSoilSaturation(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleRunSimulation}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Run Predictive Hydrograph Simulation</span>
                </button>
              </div>
            </div>

            {/* Simulation Projection Dashboard */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Hydrograph &amp; Breach Probability Output
              </span>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Baseline Deluge Benchmark:</span>
                  <span className="text-xs font-bold text-white">{selectedDataset.title}</span>
                </div>

                {/* Key Projection Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Projected Peak Inflow</span>
                    <span className="text-base font-black text-rose-400">
                      {simResults.projectedPeakInflowCusecs.toLocaleString()} cusecs
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Time to Peak Surge</span>
                    <span className="text-base font-black text-amber-400">
                      {simResults.timeToPeakHours} Hours
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Breach Risk Probability</span>
                    <span className="text-base font-black text-cyan-400">
                      {simResults.spillwayBreachProbabilityPct}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Evacuation Lead Time</span>
                    <span className="text-base font-black text-emerald-400">
                      {simResults.recommendedEvacuationLeadHours} Hours
                    </span>
                  </div>
                </div>

                {/* Actionable Command Advisory */}
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs">
                  <span className="font-bold text-cyan-300 block mb-1">
                    AI EOC Hydraulic Directive:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Under {rainfallRate} mm/hr precipitation and {reservoirCapacity}% starting reservoir level, spillway discharge must be initiated at hour {Math.max(1, Math.floor(simResults.timeToPeakHours * 0.4))} to avoid urban inundation along low-lying river causeways.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
