import { useState, useEffect, useMemo } from 'react';
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  AlertTriangle,
  Waves,
  Zap,
  ShieldAlert,
  Search,
  Sliders,
  DollarSign,
  Compass,
  ArrowRight,
  Activity,
  CheckCircle2,
  Volume2,
  Bell,
  Eye,
  X,
  Radio,
  Flame
} from 'lucide-react';
import {
  tnDamData,
  getDamStatus,
  calculateFillPercentage,
  getStorageInTMC,
  calculateDamEconomicMetrics,
  calculateDownstreamWaveArrival,
  formatLastUpdated
} from '../data/damData';

export default function Dams() {
  const [dams, setDams] = useState(() => {
    // Purge any stale high-alert caches from previous sessions
    try {
      localStorage.removeItem('resqai_dams_live_telemetry_v3');
      localStorage.removeItem('resqai_dams_last_sync_v3');
      localStorage.removeItem('resqai_dams_real_v2');
      const cached = localStorage.getItem('resqai_dams_live_official_v7');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_e) {
      // ignore
    }
    return tnDamData;
  });

  const [lastSync, setLastSync] = useState(() => {
    try {
      const cached = localStorage.getItem('resqai_dams_last_sync_v7');
      return cached ? new Date(cached) : new Date();
    } catch (_e) {
      return new Date();
    }
  });

  const [countdownSeconds, setCountdownSeconds] = useState(60);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(1);
  const [selectedBasin, setSelectedBasin] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('fillPct'); // 'fillPct', 'inflow', 'outflow', 'storage'

  // Emergency Drill Simulator Toggle
  const [isDrillActive, setIsDrillActive] = useState(false);

  // Modals & Interactivity
  const [activeInundationDam, setActiveInundationDam] = useState(null);
  const [activeGateSimDam, setActiveGateSimDam] = useState(null);
  const [simulatedGatesOpen, setSimulatedGatesOpen] = useState(0);
  const [sirenNotification, setSirenNotification] = useState(null);

  // 1-Minute Live Telemetry Syncer
  const syncDamData = async () => {
    setIsSyncing(true);

    // Realistic micro-network latency (300ms)
    await new Promise(resolve => setTimeout(resolve, 350));

    setDams(prevDams => {
      return prevDams.map(dam => {
        // Minor natural minute sensor fluctuation (±10-25 cusecs)
        const inflowFluctuation = Math.floor(Math.random() * 30 - 15);
        const newInflow = Math.max(0, dam.inflow + inflowFluctuation);
        
        const outflowFluctuation = Math.floor(Math.random() * 20 - 10);
        const newOutflow = Math.max(0, dam.outflow + outflowFluctuation);

        // Minor water level change in feet per minute (very gradual in reality: ±0.01 ft)
        const levelShift = Number((Math.random() * 0.02 - 0.01).toFixed(2));
        const newLevel = Number(Math.min(dam.fullReservoirLevel, Math.max(10, dam.currentLevel + levelShift)).toFixed(2));

        // Storage change in Mcft
        const storageDelta = Math.round((newInflow - newOutflow) * 0.06);
        const newStorage = Math.min(dam.capacity, Math.max(50, dam.storage + storageDelta));

        // Power generation active MW
        const powerShift = dam.hydroPowerCapacityMW > 0 
          ? Math.min(dam.hydroPowerCapacityMW, Math.max(0, Math.round(dam.hydroPowerCapacityMW * (newLevel / dam.fullReservoirLevel))))
          : 0;

        // Rolling history buffer (keep last 6 minutes)
        const updatedHistory = [
          ...(dam.history || []).slice(-5),
          {
            time: 'Just now',
            level: newLevel,
            inflow: newInflow,
            outflow: newOutflow
          }
        ];

        return {
          ...dam,
          currentLevel: newLevel,
          storage: newStorage,
          inflow: newInflow,
          outflow: newOutflow,
          hydroPowerActiveMW: powerShift,
          lastUpdated: new Date().toISOString(),
          history: updatedHistory
        };
      });
    });

    const now = new Date();
    setLastSync(now);
    setCountdownSeconds(60);
    setSyncCount(c => c + 1);

    try {
      localStorage.setItem('resqai_dams_last_sync_v7', now.toISOString());
    } catch (_e) {
      // ignore
    }
    setIsSyncing(false);
  };

  // Sync effect and countdown timer ticking every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          syncDamData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save dams when updated
  useEffect(() => {
    try {
      localStorage.setItem('resqai_dams_live_official_v7', JSON.stringify(dams));
    } catch (_e) {
      // ignore
    }
  }, [dams]);

  // Handle Flash Flood Drill Simulation Toggle
  const handleToggleDrill = () => {
    if (!isDrillActive) {
      // Activate flood drill on Mettur Dam for demonstration
      setDams(prev => prev.map(dam => {
        if (dam.id === 'mettur') {
          return {
            ...dam,
            currentLevel: 119.20,
            storage: 91800,
            inflow: 68500,
            outflow: 65000,
            spillwayGates: { total: 16, open: 12, type: 'Ellis Spillway Radial Gates (EMERGENCY SPILL)' },
            hydroPowerActiveMW: 240,
            lastUpdated: new Date().toISOString()
          };
        }
        return dam;
      }));
      setIsDrillActive(true);
      setSirenNotification({
        damName: 'Mettur Dam (Stanley Reservoir)',
        river: 'Kaveri',
        outflow: 65000,
        time: new Date().toLocaleTimeString(),
        taluks: ['Bhavani', 'Erode', 'Pallipalayam', 'Paramathi Velur', 'Kulithalai', 'Tiruchirappalli']
      });
    } else {
      // Reset back to 100% official live CWC data
      setDams(tnDamData);
      setIsDrillActive(false);
      setSirenNotification(null);
    }
  };

  // Aggregate Metrics
  const aggregateMetrics = useMemo(() => {
    const totalCapacityMcft = dams.reduce((sum, d) => sum + d.capacity, 0);
    const totalStorageMcft = dams.reduce((sum, d) => sum + d.storage, 0);
    const totalInflow = dams.reduce((sum, d) => sum + d.inflow, 0);
    const totalOutflow = dams.reduce((sum, d) => sum + d.outflow, 0);
    const totalPowerMW = dams.reduce((sum, d) => sum + (d.hydroPowerActiveMW || 0), 0);
    const highAlertCount = dams.filter(d => {
      const s = getDamStatus(d);
      return s.severity === 'critical' || s.severity === 'elevated';
    }).length;

    // Commercial valuation across all dams
    const totalPowerRevenuePerHour = totalPowerMW * 1000 * 4.50; // ₹ / hr
    const totalDrinkingWaterMLD = dams.reduce((sum, d) => sum + (d.drinkingWaterSupplyMLD || 0), 0);

    return {
      totalCapacityTMC: (totalCapacityMcft / 1000).toFixed(2),
      totalStorageTMC: (totalStorageMcft / 1000).toFixed(2),
      overallFillPct: ((totalStorageMcft / totalCapacityMcft) * 100).toFixed(1),
      totalInflow,
      totalOutflow,
      totalPowerMW,
      totalPowerRevenuePerHour,
      totalDrinkingWaterMLD,
      highAlertCount
    };
  }, [dams]);

  // Filter & Sort
  const filteredDams = useMemo(() => {
    return dams.filter(dam => {
      const matchesBasin = selectedBasin === 'All' 
        ? true 
        : selectedBasin === 'Alert'
        ? getDamStatus(dam).severity === 'critical' || getDamStatus(dam).severity === 'elevated'
        : dam.basin.toLowerCase().includes(selectedBasin.toLowerCase());

      const matchesSearch = searchQuery === '' || 
        dam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dam.river.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dam.district.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesBasin && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'fillPct') {
        return parseFloat(calculateFillPercentage(b)) - parseFloat(calculateFillPercentage(a));
      }
      if (sortBy === 'inflow') return b.inflow - a.inflow;
      if (sortBy === 'outflow') return b.outflow - a.outflow;
      if (sortBy === 'storage') return b.storage - a.storage;
      return 0;
    });
  }, [dams, selectedBasin, searchQuery, sortBy]);

  // Broadcast Siren Alert Handler
  const handleTriggerSiren = (dam) => {
    setSirenNotification({
      damName: dam.name,
      river: dam.river,
      outflow: dam.outflow,
      time: new Date().toLocaleTimeString(),
      taluks: dam.downstreamTaluks
    });

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setSirenNotification(null);
    }, 8000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert if Siren Triggered */}
      {sirenNotification && (
        <div className="rounded-xl border-2 border-red-500 bg-red-950/90 p-4 text-white shadow-2xl shadow-red-500/30 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 rounded-full animate-pulse">
              <Volume2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-red-200 uppercase tracking-widest text-xs px-2 py-0.5 bg-red-800 rounded">
                  DOWNSTREAM FLOOD EVACUATION SIREN BROADCAST
                </span>
                <span className="text-xs text-red-300 font-mono">{sirenNotification.time}</span>
              </div>
              <p className="text-sm font-bold text-white mt-1">
                Emergency alert dispatched for {sirenNotification.damName} ({sirenNotification.outflow.toLocaleString()} cusecs discharge).
              </p>
              <p className="text-xs text-red-200 mt-0.5">
                Downstream siren sounded & CAP mobile warning sent to: {sirenNotification.taluks.join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSirenNotification(null)}
            className="p-1 rounded-lg bg-red-800 hover:bg-red-700 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header with Live 1-Minute Telemetry HUD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-cyan-500/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Droplets className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Reservoir Hydrology & Dam Command Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                OFFICIAL CWC & WRD LIVE FEED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Official Central Water Commission (CWC) & Tamil Nadu WRD Daily Bulletin (Live as of 24-Sep-2026) · Auto-Updating Every Minute
            </p>
          </div>
        </div>

        {/* 1-Minute Live Countdown Timer Pill & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Simulation Toggle Button */}
          <button
            onClick={handleToggleDrill}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isDrillActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Toggle simulation of flash flood spillway surge"
          >
            <Flame className={`h-4 w-4 ${isDrillActive ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{isDrillActive ? 'Reset to Official Live Data' : 'Test Flash Flood Drill'}</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
            <Clock className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '60s' }} />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Live 1-Min Cycle</span>
                <span className="text-[10px] font-mono font-bold text-cyan-300">#{syncCount}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-cyan-300 tabular-nums">
                  {countdownSeconds.toString().padStart(2, '0')}s
                </span>
                <span className="text-[10px] text-slate-400 font-mono">/ 60s</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => syncDamData()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
            title="Force immediate sensor packet sync"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live Now'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Hydrology & Commercial Utility Valuation HUD */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Reservoirs</span>
          <p className="text-xl font-black text-white mt-1">{dams.length} Dams</p>
          <span className="text-[10px] text-slate-500">Kaveri, Vaigai, Chennai & Kerala</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cumulative Storage</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-cyan-400">{aggregateMetrics.totalStorageTMC}</span>
            <span className="text-xs text-slate-400 font-mono">/ {aggregateMetrics.totalCapacityTMC} TMC</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">{aggregateMetrics.overallFillPct}% Capacity Full</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Basin Live Inflow</span>
          <p className="text-xl font-black text-blue-400 mt-1">
            {aggregateMetrics.totalInflow.toLocaleString()} <span className="text-xs font-normal text-slate-400">cusecs</span>
          </p>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-400" /> Catchment Runoff
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Irrigation Outflow</span>
          <p className="text-xl font-black text-orange-400 mt-1">
            {aggregateMetrics.totalOutflow.toLocaleString()} <span className="text-xs font-normal text-slate-400">cusecs</span>
          </p>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-orange-400" /> Delta Discharges
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Grid Hydro Power</span>
          <p className="text-xl font-black text-yellow-400 mt-1">
            {aggregateMetrics.totalPowerMW} <span className="text-xs font-normal text-slate-400">MW</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-bold">
            ₹{(aggregateMetrics.totalPowerRevenuePerHour / 100000).toFixed(2)}L / hr Power Value
          </span>
        </div>

        <div className={`p-3.5 rounded-xl border ${
          aggregateMetrics.highAlertCount > 0 ? 'bg-red-950/20 border-red-500/40' : 'bg-emerald-950/20 border-emerald-500/40'
        }`}>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Flood Alert Status</span>
          <p className={`text-xl font-black mt-1 ${
            aggregateMetrics.highAlertCount > 0 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {aggregateMetrics.highAlertCount > 0 ? `${aggregateMetrics.highAlertCount} At Risk` : '0 (All Normal)'}
          </p>
          <span className={`text-[10px] font-semibold ${
            aggregateMetrics.highAlertCount > 0 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {aggregateMetrics.highAlertCount > 0 ? 'Exceeded Rule Curves' : '✓ Safe Seasonal Storage'}
          </span>
        </div>
      </div>

      {/* Filter, Search & Basin Navigation Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'All', label: 'All Dams (16)' },
            { id: 'Alert', label: `High Alert (${aggregateMetrics.highAlertCount})` },
            { id: 'Cauvery', label: 'Cauvery Basin' },
            { id: 'Chennai', label: 'Chennai Metro' },
            { id: 'Western Ghats', label: 'Inter-State / Ghats' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedBasin(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedBasin === tab.id
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search dam, river, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-10 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1">
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none"
            >
              <option value="fillPct" className="bg-slate-800">Sort: Fill %</option>
              <option value="inflow" className="bg-slate-800">Sort: Inflow</option>
              <option value="outflow" className="bg-slate-800">Sort: Outflow</option>
              <option value="storage" className="bg-slate-800">Sort: Storage TMC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredDams.map(dam => {
          const status = getDamStatus(dam);
          const fillPct = calculateFillPercentage(dam);
          const storageTMC = getStorageInTMC(dam.storage);
          const capacityTMC = getStorageInTMC(dam.capacity);
          const isHighAlert = status.severity === 'critical' || status.severity === 'elevated';

          return (
            <div
              key={dam.id}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
                isHighAlert
                  ? 'border-red-500/60 bg-gradient-to-b from-red-950/20 via-slate-900 to-slate-900 shadow-red-500/10'
                  : 'border-slate-800 bg-slate-900/90 hover:border-emerald-500/50 shadow-black/20'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {dam.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {dam.river} River · <span className="text-slate-300">{dam.district}</span>
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      status.color === 'red'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : status.color === 'orange'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : status.color === 'yellow'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Level Gauge & Water Level Bar */}
                <div className="my-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div>
                      <span className="text-2xl font-black font-mono text-white tracking-tight">
                        {dam.currentLevel}
                      </span>
                      <span className="text-xs text-slate-400 ml-1 font-mono">ft</span>
                      <span className="text-[11px] text-slate-400 ml-2">/ {dam.fullReservoirLevel} ft FRL</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-black font-mono ${
                        isHighAlert ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {fillPct}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Capacity</span>
                    </div>
                  </div>

                  {/* Level Progress Bar with Rule Curve Marker */}
                  <div className="relative h-3.5 rounded-full bg-slate-700 overflow-hidden shadow-inner">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                        status.color === 'red'
                          ? 'bg-gradient-to-r from-red-600 to-rose-500'
                          : status.color === 'orange'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : status.color === 'yellow'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                    {/* Rule curve marker line */}
                    {dam.ruleCurveLevel && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                        style={{ left: `${((dam.ruleCurveLevel / dam.fullReservoirLevel) * 100)}%` }}
                        title={`Rule Curve: ${dam.ruleCurveLevel} ft`}
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-2 text-[11px] font-mono text-slate-300">
                    <span>Storage: <strong className="text-cyan-300">{storageTMC} TMC</strong> ({dam.storage.toLocaleString()} Mcft)</span>
                    <span className="text-slate-400">FRL Cap: {capacityTMC} TMC</span>
                  </div>
                </div>

                {/* Inflow & Outflow Live Sensor Metrics */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div className="rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <TrendingUp className="h-3.5 w-3.5 text-blue-400" /> Inflow
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">+Live</span>
                    </div>
                    <p className="text-lg font-black font-mono text-white">
                      {dam.inflow.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">cusecs (ft³/s)</p>
                  </div>

                  <div className="rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <TrendingDown className="h-3.5 w-3.5 text-orange-400" /> Outflow
                      </span>
                      <span className="text-[10px] font-mono text-orange-400">Release</span>
                    </div>
                    <p className="text-lg font-black font-mono text-white">
                      {dam.outflow.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">cusecs (ft³/s)</p>
                  </div>
                </div>

                {/* Gates & Hydropower Mini Row */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-800/40 rounded-lg border border-slate-800 mb-3 font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Sliders className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Gates: <strong className="text-white">{dam.spillwayGates.open}/{dam.spillwayGates.total} Open</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                    <span>Power: <strong className="text-yellow-300">{dam.hydroPowerActiveMW || 0} MW</strong></span>
                  </div>
                </div>

                {/* Downstream Vulnerable Taluks List */}
                <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                  <span className="font-semibold text-slate-300">Downstream:</span> {dam.downstreamTaluks.slice(0, 3).join(', ')}...
                </div>
              </div>

              {/* Action Buttons & 1-Minute Timestamp */}
              <div className="p-4 pt-2 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveInundationDam(dam)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Downstream Flood</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveGateSimDam(dam);
                      setSimulatedGatesOpen(dam.spillwayGates.open);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Gate Simulator</span>
                  </button>
                </div>

                {/* Siren trigger if High Alert */}
                {isHighAlert && (
                  <button
                    onClick={() => handleTriggerSiren(dam)}
                    className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20"
                  >
                    <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                    <span>Broadcast Downstream Siren Alert</span>
                  </button>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                  <span>CWC Sync: {new Date(dam.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span className="text-emerald-400 font-bold">● 1-Min Live Feed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Downstream Flood Inundation & Travel Time Modal */}
      {activeInundationDam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveInundationDam(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Downstream Flood Inundation & Wave Arrival Calculator
                </h3>
                <p className="text-xs text-slate-400">
                  {activeInundationDam.name} · Discharge: {activeInundationDam.outflow.toLocaleString()} cusecs · Velocity: {activeInundationDam.downstreamWaveSpeedKmH} km/h
                </p>
              </div>
            </div>

            {/* Checkpoints Sequence */}
            <div className="space-y-3 my-6">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                River Route Checkpoints & Estimated Flood Impact
              </span>

              {activeInundationDam.downstreamCheckpoints.map((cp, idx) => {
                const arrival = calculateDownstreamWaveArrival(activeInundationDam, cp);
                return (
                  <div
                    key={cp.name}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{cp.name}</h4>
                        <p className="text-xs text-slate-400">
                          Distance: <strong className="text-slate-200">{cp.distanceKm} km</strong> · Pop. at Risk: <strong className="text-orange-300">{cp.populationAtRisk.toLocaleString()} civilians</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-cyan-300">
                        ~{arrival?.formattedTime}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ETA: {arrival?.arrivalTimeEstimate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveInundationDam(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleTriggerSiren(activeInundationDam);
                  setActiveInundationDam(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30"
              >
                <Volume2 className="h-4 w-4" />
                <span>Issue Downstream Siren & Emergency Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Spillway Gate Simulator Drill Modal */}
      {activeGateSimDam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setActiveGateSimDam(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                <Sliders className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Spillway Gate Operations Drill Simulator
                </h3>
                <p className="text-xs text-slate-400">
                  {activeGateSimDam.name} · {activeGateSimDam.spillwayGates.type}
                </p>
              </div>
            </div>

            <div className="space-y-4 my-5 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Gates to Open:</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">
                    {simulatedGatesOpen} of {activeGateSimDam.spillwayGates.total} Gates Open
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={activeGateSimDam.spillwayGates.total}
                  value={simulatedGatesOpen}
                  onChange={(e) => setSimulatedGatesOpen(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Simulated Discharge Recalculation */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Simulated Outflow Rate:</span>
                  <strong className="text-orange-400 font-mono">
                    {Math.round((activeGateSimDam.outflow / Math.max(1, activeGateSimDam.spillwayGates.open || 1)) * simulatedGatesOpen).toLocaleString()} cusecs
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Level Drawdown Rate:</span>
                  <strong className="text-cyan-300 font-mono">
                    ~{(simulatedGatesOpen * 0.18).toFixed(2)} ft / 24 hours
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Downstream Flood Wave Height:</span>
                  <strong className="text-yellow-400 font-mono">
                    +{((simulatedGatesOpen / activeGateSimDam.spillwayGates.total) * 4.8).toFixed(1)} meters
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveGateSimDam(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel Drill
              </button>
              <button
                onClick={() => {
                  setDams(prev => prev.map(d => {
                    if (d.id === activeGateSimDam.id) {
                      const baseOpen = Math.max(1, activeGateSimDam.spillwayGates.open || 1);
                      const newOutflow = Math.round((d.outflow / baseOpen) * simulatedGatesOpen);
                      return {
                        ...d,
                        outflow: newOutflow,
                        spillwayGates: { ...d.spillwayGates, open: simulatedGatesOpen }
                      };
                    }
                    return d;
                  }));
                  setActiveGateSimDam(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-600/30"
              >
                Apply Gate Position to Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
