import { useState, useEffect } from 'react';
import {
  Smartphone,
  Radio,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Battery,
  MapPin,
  AlertOctagon,
  Camera,
  Send,
  Copy,
  Sparkles,
  Users,
  Clock,
  Volume2,
  Activity,
  HeartPulse,
  Navigation,
  FileCode,
  Terminal,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { offlineSyncService } from '../services/offlineSyncService';

export default function MobileResponderPage() {
  const {
    tasks,
    updateTaskStatus,
    completeMission,
    addSOSBeacon,
    teams,
    showNotification,
  } = useApp();

  // Tab State: 'simulator' | 'voiceOps' | 'code'
  const [activeTab, setActiveTab] = useState('simulator');
  const [phoneOs, setPhoneOs] = useState('ios'); // 'ios' | 'android'
  const [mobileScreen, setMobileScreen] = useState('dashboard'); // 'dashboard' | 'triage' | 'voice' | 'sync'

  // Offline / Network State
  const [isOffline, setIsOffline] = useState(() => offlineSyncService.isSimulatedOffline);
  const [offlineQueue, setOfflineQueue] = useState(() => offlineSyncService.getState().queue);
  const [isSyncing, setIsSyncing] = useState(false);

  // Field Responder Device State
  const [triageCounts, setTriageCounts] = useState({ red: 2, yellow: 5, green: 11, black: 0 });
  const [taskStatus, setTaskStatus] = useState('ON_SCENE');
  const [sosSent, setSosSent] = useState(false);
  const [reportText, setReportText] = useState('');
  const [simulatedPhoto, setSimulatedPhoto] = useState(false);
  const [gpsCoords] = useState({ lat: 13.0182, lng: 80.2215, locName: 'Saidapet Bridge (Adyar Delta)' });




  // ── Sync with offlineSyncService ───────────────────────────────────────────
  useEffect(() => {
    const unsub = offlineSyncService.subscribe((state) => {
      setIsOffline(state.isSimulatedOffline);
      setOfflineQueue(state.queue);
      setIsSyncing(state.syncInProgress);
    });
    return () => unsub();
  }, []);



  // ── One-Touch SOS Trigger ──────────────────────────────────────────────────
  const triggerSosBeacon = () => {
    setSosSent(true);

    // Audible buzzer simulation
    playEmergencyChime();

    const sosPayload = {
      senderName: 'Echo-Unit-04 (SDRF Field Lead)',
      phone: '+91-94451-99882',
      areaName: gpsCoords.locName,
      lat: gpsCoords.lat,
      lng: gpsCoords.lng,
      message: 'CRITICAL FIELD UNIT MAYDAY: Water surging past 1.5m, boat capsized, 12 victims trapped.',
      severity: 'critical',
      unitId: 'Echo-Unit-04',
      officer: 'Sub-Inspector R. Ramesh',
    };

    if (isOffline) {
      offlineSyncService.queueAction('FIELD_RESPONDER_SOS', sosPayload, {
        gps: { lat: gpsCoords.lat, lng: gpsCoords.lng },
      });
      alert('⚠️ Offline Mode: Distress SOS beacon cached to device SQLite/WatermelonDB storage. Queued for immediate LoRa / 5G burst.');
    } else {
      addSOSBeacon(sosPayload);
    }

    setTimeout(() => setSosSent(false), 4500);
  };

  // ── Submit Field Report Memo ──────────────────────────────────────────────
  const submitFieldReport = (textToSubmit) => {
    const text = textToSubmit || reportText;
    if (!text.trim()) return;

    const reportPayload = {
      id: `memo-${Date.now()}`,
      text: text.trim(),
      unit: 'Echo-Unit-04',
      officer: 'SDRF 4th Bn',
      location: gpsCoords.locName,
      triage: { ...triageCounts },
      hasPhoto: simulatedPhoto,
      timestamp: new Date().toISOString(),
    };

    if (isOffline) {
      offlineSyncService.queueAction('FIELD_REPORT', reportPayload, {
        gps: { lat: gpsCoords.lat, lng: gpsCoords.lng },
      });
      showNotification({
        id: Date.now(),
        type: 'report',
        title: 'MEMO QUEUED OFFLINE',
        message: `Field observation cached to on-device queue (#${offlineQueue.length + 1}).`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    } else {
      offlineSyncService.queueAction('FIELD_REPORT', reportPayload);
      showNotification({
        id: Date.now(),
        type: 'report',
        title: 'FIELD REPORT TRANSMITTED',
        message: `Dispatched observation to EOC: "${text.slice(0, 45)}..."`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    }

    setReportText('');
    setSimulatedPhoto(false);
  };

  // ── Audio Beep / Siren Synthesis ──────────────────────────────────────────
  const playEmergencyChime = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch (e) {
      console.warn('Audio chime unsupported:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Field Responder Mobile App & Voice AI Ops
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  Live Field Companion
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                  Hands-Free Voice AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cross-platform companion for NDRF/SDRF ground troops: One-touch SOS beacon, START triage protocol, on-device offline SQLite cache, and speech-driven tactical commands.
              </p>
            </div>
          </div>
        </div>

        {/* Live Field Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Field Unit Synchronized</span>
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE FIELD DEVICE SIMULATOR ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Device Control Panel & Telemetry Stats */}
          <div className="lg:col-span-6 space-y-4">
            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Ground Unit</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">Echo-Unit-04</span>
                <span className="text-[10px] text-slate-500 block">SDRF 4th Bn</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Telemetry Fix</span>
                <span className="text-sm font-bold text-white font-mono">13.018° N, 80.221° E</span>
                <span className="text-[10px] text-emerald-400 block">Saidapet Bridge</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Comms Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`h-2 w-2 rounded-full ${isOffline ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span className={`text-xs font-bold ${isOffline ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isOffline ? 'OFFLINE MESH' : 'ONLINE 5G'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {isOffline ? `${offlineQueue.length} queued events` : 'Synchronized with EOC'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">START Victims</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {triageCounts.red + triageCounts.yellow + triageCounts.green + triageCounts.black} Total
                </span>
                <span className="text-[10px] text-red-400 block font-semibold">{triageCounts.red} Immediate Red</span>
              </div>
            </div>

            {/* Hardware & Simulation Controls */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Device Hardware & Disaster Blackout Controls
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Form Factor Toggle */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Form Factor:</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {phoneOs === 'ios' ? 'iPhone 16 Pro (Island)' : 'Galaxy S24 Ultra'}
                    </span>
                  </div>
                  <button
                    onClick={() => setPhoneOs(phoneOs === 'ios' ? 'android' : 'ios')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-bold transition-all"
                  >
                    Switch OS
                  </button>
                </div>

                {/* Comms Blackout Toggle */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Telecom Comms:</span>
                    <span className={`text-[11px] font-bold ${isOffline ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isOffline ? 'Disaster Blackout' : 'Cellular 5G Active'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !isOffline;
                      setIsOffline(next);
                      offlineSyncService.setSimulatedOffline(next);
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      isOffline
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isOffline ? 'Restore 5G' : 'Simulate Blackout'}
                  </button>
                </div>
              </div>

              {/* Offline Queue Inspector Mini */}
              {offlineQueue.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">
                        {offlineQueue.length} Events Cached in Local SQLite Store
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Auto-synchronization triggers when network connectivity is re-established.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => offlineSyncService.syncQueuedActions()}
                    disabled={isOffline || isSyncing}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Flush Now'}</span>
                  </button>
                </div>
              )}

              {/* Native Capabilities Overview */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                    <Radio className="h-3 w-3 text-red-400" /> One-Touch SOS
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Transmits distress beacon directly into Central EOC global state and sound siren.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                    <HeartPulse className="h-3 w-3 text-emerald-400" /> START Protocol
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Categorizes casualties (Red, Yellow, Green, Black) with hospital capacity sync.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                    <Mic className="h-3 w-3 text-cyan-400" /> Voice AI Ops
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Touch-free command recognition with natural voice synthesis feedback.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                    <WifiOff className="h-3 w-3 text-amber-400" /> Offline SQLite
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Operates without cellular signal and batch transmits when reconnecting.
                  </p>
                </div>
              </div>
            </div>

            {/* Live GPS Coordinates Widget */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                <div>
                  <span className="text-white font-bold block">Assigned Sector: Saidapet Causeway</span>
                  <span className="text-[10px] text-slate-400">Adyar River Delta · Zone 9 Emergency Corridor</span>
                </div>
              </div>
              <span className="font-mono text-cyan-400 text-xs font-bold">13.0182° N, 80.2215° E</span>
            </div>
          </div>

          {/* Right Column: High-Fidelity Interactive Mobile Phone Frame */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              className={`w-[360px] h-[720px] bg-slate-950 rounded-[48px] border-4 ${
                phoneOs === 'ios'
                  ? 'border-slate-700 shadow-2xl shadow-cyan-500/10'
                  : 'border-slate-800 rounded-[36px]'
              } relative flex flex-col overflow-hidden ring-1 ring-cyan-500/30 select-none`}
            >
              {/* Phone Notch / Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Status Bar */}
              <div className="pt-3 px-6 pb-1.5 flex items-center justify-between text-[10px] text-slate-300 font-mono z-20">
                <span>09:41</span>
                <div className="flex items-center gap-2">
                  {isOffline ? (
                    <WifiOff className="h-3 w-3 text-amber-400 animate-pulse" />
                  ) : (
                    <Wifi className="h-3 w-3 text-emerald-400" />
                  )}
                  <Battery className="h-3 w-3 text-emerald-400" />
                </div>
              </div>

              {/* App Internal Header */}
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">ResQ Field Unit</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold">
                      Echo-04
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isOffline ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                      }`}
                    />
                    <span className={isOffline ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {isOffline ? 'OFFLINE (Local Queue)' : 'EOC Cloud Synced (5G)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Saidapet
                  </span>
                </div>
              </div>

              {/* Phone Screen Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
                {mobileScreen === 'dashboard' && (
                  <>
                    {/* Primary SOS Button */}
                    <button
                      onClick={triggerSosBeacon}
                      className={`w-full py-4 rounded-2xl font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
                        sosSent
                          ? 'bg-amber-500 text-slate-950 animate-bounce shadow-amber-500/50'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 hover:shadow-red-600/60'
                      }`}
                    >
                      <AlertOctagon className="h-5 w-5" />
                      <span>{sosSent ? '🚨 DISTRESS BEACON ACTIVE!' : 'ONE-TOUCH DISTRESS SOS'}</span>
                    </button>

                    {/* Assigned Mission Task */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          Active Mission #842
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300">
                          {taskStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs leading-snug">
                        Evacuate 12 stranded residents from Adyar Causeway breach
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <MapPin className="h-3 w-3 text-red-400" />
                        <span>Saidapet Delta · Sector 4B</span>
                        <Clock className="h-3 w-3 ml-2 text-cyan-400" />
                        <span>ETA: On Scene</span>
                      </div>

                      {/* Task Step Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                        <button
                          onClick={() => {
                            setTaskStatus('ON_SCENE');
                            if (tasks && tasks[0]) updateTaskStatus(tasks[0].id, 'in-progress');
                          }}
                          className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all ${
                            taskStatus === 'ON_SCENE'
                              ? 'bg-cyan-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          On Scene
                        </button>
                        <button
                          onClick={() => {
                            setTaskStatus('TRIAGE_DONE');
                            if (tasks && tasks[0]) updateTaskStatus(tasks[0].id, 'in-progress');
                          }}
                          className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all ${
                            taskStatus === 'TRIAGE_DONE'
                              ? 'bg-cyan-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          Triage Done
                        </button>
                        <button
                          onClick={() => {
                            setTaskStatus('COMPLETED');
                            if (teams && teams[0]) {
                              completeMission(teams[0].id, 'Completed evacuation of 12 civilians', 12);
                            }
                          }}
                          className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all ${
                            taskStatus === 'COMPLETED'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                    </div>

                    {/* Tactical START Triage Counters */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300 uppercase">
                          START Triage Matrix
                        </span>
                        <button
                          onClick={() => setMobileScreen('triage')}
                          className="text-[10px] text-cyan-400 hover:underline"
                        >
                          Expand Full →
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/40">
                          <div className="text-[9px] font-bold text-red-400">RED</div>
                          <div className="text-base font-mono font-bold text-white">{triageCounts.red}</div>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, red: c.red + 1 }))}
                            className="text-[10px] text-red-300 hover:text-white px-1.5 py-0.5 rounded bg-red-900/50 mt-1"
                          >
                            +1
                          </button>
                        </div>

                        <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40">
                          <div className="text-[9px] font-bold text-amber-400">YELLOW</div>
                          <div className="text-base font-mono font-bold text-white">{triageCounts.yellow}</div>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, yellow: c.yellow + 1 }))}
                            className="text-[10px] text-amber-300 hover:text-white px-1.5 py-0.5 rounded bg-amber-900/50 mt-1"
                          >
                            +1
                          </button>
                        </div>

                        <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                          <div className="text-[9px] font-bold text-emerald-400">GREEN</div>
                          <div className="text-base font-mono font-bold text-white">{triageCounts.green}</div>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, green: c.green + 1 }))}
                            className="text-[10px] text-emerald-300 hover:text-white px-1.5 py-0.5 rounded bg-emerald-900/50 mt-1"
                          >
                            +1
                          </button>
                        </div>

                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="text-[9px] font-bold text-slate-400">BLACK</div>
                          <div className="text-base font-mono font-bold text-white">{triageCounts.black}</div>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, black: c.black + 1 }))}
                            className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 mt-1"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Incident Observation & Camera Photo */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Field Observation Memo</span>
                        <button
                          type="button"
                          onClick={() => setSimulatedPhoto(!simulatedPhoto)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                            simulatedPhoto
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Camera className="h-3 w-3" />
                          <span>{simulatedPhoto ? 'Photo Attached' : 'Attach Photo'}</span>
                        </button>
                      </div>

                      {simulatedPhoto && (
                        <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-mono">IMG_FLOOD_BREACH_842.JPG (Geotagged)</span>
                          <button
                            onClick={() => setSimulatedPhoto(false)}
                            className="text-slate-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              submitFieldReport();
                            }
                          }}
                          placeholder="e.g. Water reached 1.6m, 2 elderly trapped..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => submitFieldReport()}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Subscreen: START Triage Matrix Expanded */}
                {mobileScreen === 'triage' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white text-xs">START Casualty Protocol</span>
                      <button
                        onClick={() => setMobileScreen('dashboard')}
                        className="text-[10px] text-cyan-400"
                      >
                        ← Back to Mission
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-red-500/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 font-bold text-xs">RED · IMMEDIATE</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, red: Math.max(0, c.red - 1) }))}
                            className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white text-sm">{triageCounts.red}</span>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, red: c.red + 1 }))}
                            className="w-6 h-6 rounded bg-red-600 text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Life-threatening trauma or airway compromise. Needs immediate ALS ambulance transit.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-bold text-xs">YELLOW · DELAYED</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, yellow: Math.max(0, c.yellow - 1) }))}
                            className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white text-sm">{triageCounts.yellow}</span>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, yellow: c.yellow + 1 }))}
                            className="w-6 h-6 rounded bg-amber-600 text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Serious fractures or systemic distress. Can tolerate 1-2h delay before transport.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold text-xs">GREEN · MINOR</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, green: Math.max(0, c.green - 1) }))}
                            className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white text-sm">{triageCounts.green}</span>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, green: c.green + 1 }))}
                            className="w-6 h-6 rounded bg-emerald-600 text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Walking wounded. Minor lacerations or abrasions. Directed to nearby community shelter.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold text-xs">BLACK · EXPECTANT</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, black: Math.max(0, c.black - 1) }))}
                            className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white text-sm">{triageCounts.black}</span>
                          <button
                            onClick={() => setTriageCounts((c) => ({ ...c, black: c.black + 1 }))}
                            className="w-6 h-6 rounded bg-slate-700 text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Deceased or non-survivable catastrophic injuries. Mortuary affairs alerted.
                      </p>
                    </div>
                  </div>
                )}

                {/* Subscreen: Offline Sync Manager */}
                {mobileScreen === 'sync' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white text-xs">Offline Sync Queue</span>
                      <button
                        onClick={() => setMobileScreen('dashboard')}
                        className="text-[10px] text-cyan-400"
                      >
                        ← Back to Mission
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Cached Items:</span>
                        <span className="font-mono text-cyan-400 font-bold">{offlineQueue.length} events</span>
                      </div>
                      <button
                        onClick={() => offlineSyncService.syncQueuedActions()}
                        disabled={isOffline || offlineQueue.length === 0}
                        className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs"
                      >
                        Batch Replay to Central EOC
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                      {offlineQueue.length === 0 ? (
                        <p className="text-center text-slate-500 text-[11px] py-4">No pending offline actions.</p>
                      ) : (
                        offlineQueue.map((item) => (
                          <div key={item.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px]">
                            <div className="flex justify-between text-cyan-400 font-mono">
                              <span>{item.type}</span>
                              <span className="text-slate-500">{item.id.slice(-6)}</span>
                            </div>
                            <p className="text-slate-300 truncate mt-0.5">{JSON.stringify(item.payload)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom In-App Tab Navigation Bar */}
              <div className="bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-around z-20">
                <button
                  onClick={() => setMobileScreen('dashboard')}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                    mobileScreen === 'dashboard' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Mission</span>
                </button>
                <button
                  onClick={() => setMobileScreen('triage')}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                    mobileScreen === 'triage' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Triage</span>
                </button>

                <button
                  onClick={() => setMobileScreen('sync')}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                    mobileScreen === 'sync' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>Sync ({offlineQueue.length})</span>
                </button>
              </div>

              {/* Home Indicator Bar */}
              <div className="pb-2 pt-1 flex justify-center bg-slate-900">
                <div className="w-28 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
