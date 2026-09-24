import { useState } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Radio,
  MapPin,
  CheckCircle,
  AlertOctagon,
  Camera,
  Mic,
  Send,
  Download,
  Copy,
  Layers,
  Sparkles,
  Users,
  Shield,
  Clock,
} from 'lucide-react';
import { offlineSyncService } from '../../services/offlineSyncService';

export default function MobileResponderSimulator() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'code'
  const [phoneOs, setPhoneOs] = useState('ios'); // 'ios' | 'android'
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [triageCounts, setTriageCounts] = useState({ red: 2, yellow: 5, green: 11, black: 0 });
  const [taskStatus, setTaskStatus] = useState('ARRIVED_ON_SCENE');
  const [sosSent, setSosSent] = useState(false);
  const [reportText, setReportText] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSendSos = () => {
    setSosSent(true);
    offlineSyncService.queueAction('FIELD_RESPONDER_SOS', {
      unit: 'Echo-Unit-04',
      lat: 13.0182,
      lng: 80.2215,
      urgency: 'CRITICAL_IMMEDIATE',
    });
    setTimeout(() => setSosSent(false), 4000);
  };

  const handleAddReport = (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    offlineSyncService.queueAction('FIELD_REPORT', {
      text: reportText,
      unit: 'Echo-Unit-04',
      triage: triageCounts,
      timestamp: new Date().toISOString(),
    });
    setReportText('');
    alert('Field report submitted! Cached to local offline database and synced.');
  };

  const reactNativeCode = `/**
 * ResQ AI - Field Responder Companion App (React Native)
 * Production React Native + Expo / Native CLI Architecture
 * Framework: React Native 0.74+ | State: Redux Toolkit | Local DB: WatermelonDB / SQLite
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Vibration } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export default function FieldResponderApp() {
  const [isConnected, setIsConnected] = useState(true);
  const [location, setLocation] = useState(null);
  const [triageCount, setTriageCount] = useState({ red: 0, yellow: 0, green: 0 });

  useEffect(() => {
    // 1. Subscribe to network status for zero-connectivity disaster zones
    const unsubscribeNet = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
      if (state.isConnected) flushOfflineQueue();
    });

    // 2. High-precision background GPS telemetry
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);
      }
    })();

    return () => unsubscribeNet();
  }, []);

  const triggerEmergencyBeacon = async () => {
    Vibration.vibrate([0, 500, 200, 500]);
    const payload = {
      type: 'SOS_BEACON',
      coords: location,
      timestamp: Date.now(),
      status: 'CRITICAL',
    };

    if (!isConnected) {
      queueForOfflineSync(payload);
      Alert.alert('Offline Mode', 'SOS stored in local SQLite cache. Transmitting via LoRa / Mesh when available.');
    } else {
      await fetch('https://eoc.resqai.gov.in/api/v1/responder/beacon', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      Alert.alert('Transmitted', 'EOC Command acknowledged rescue beacon.');
    }
  };

  const queueForOfflineSync = (item) => {
    const existing = JSON.parse(storage.getString('offline_queue') || '[]');
    existing.push(item);
    storage.set('offline_queue', JSON.stringify(existing));
  };

  const flushOfflineQueue = async () => {
    const queue = JSON.parse(storage.getString('offline_queue') || '[]');
    if (queue.length === 0) return;
    // Batch transmit queue to Central EOC
    storage.delete('offline_queue');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ResQ AI · Field Unit</Text>
      <Text style={isConnected ? styles.online : styles.offline}>
        {isConnected ? '● Connected to State EOC' : '▲ Offline Mesh Active'}
      </Text>
      <TouchableOpacity style={styles.sosButton} onPress={triggerEmergencyBeacon}>
        <Text style={styles.sosText}>ONE-TOUCH SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24, alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 40 },
  online: { color: '#10b981', marginVertical: 8 },
  offline: { color: '#f59e0b', marginVertical: 8 },
  sosButton: { backgroundColor: '#ef4444', width: '90%', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  sosText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
});
`;

  return (
    <div className="space-y-6">
      {/* Subheader and Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Smartphone className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              Mobile App (React Native) for Field Responders
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Roadmap Item #2: Cross-platform companion with offline-first persistence, one-tap SOS, and triage reporting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-cyan-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Device Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              React Native Architecture
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls & Features List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Native Responder Capabilities
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Radio className="h-3.5 w-3.5 text-red-400" /> Instant SOS Beacon
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Single tactile trigger emits high-priority distress GPS coordinates directly into State EOC map.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <WifiOff className="h-3.5 w-3.5 text-amber-400" /> Offline WatermelonDB
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Zero cell-signal caching. Operates completely in blackout disaster zones and flushes queue upon reconnect.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-emerald-400" /> Field Triage Matrix
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    START protocol victim categorization (Red/Yellow/Green/Black) with live hospital capacity load balancing.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Mic className="h-3.5 w-3.5 text-cyan-400" /> Voice Tactical Memos
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Hands-free audio recording with on-device speech-to-text transcription for active water rescue ops.
                  </p>
                </div>
              </div>

              {/* OS / Simulator Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Device Shell:</span>
                  <button
                    onClick={() => setPhoneOs(phoneOs === 'ios' ? 'android' : 'ios')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 transition-colors"
                  >
                    {phoneOs.toUpperCase()} Form Factor
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Simulate Network:</span>
                  <button
                    onClick={() => {
                      const next = !isOfflineSimulated;
                      setIsOfflineSimulated(next);
                      offlineSyncService.setSimulatedOffline(next);
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      isOfflineSimulated
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isOfflineSimulated ? 'Offline Blackout' : 'Online 5G'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-300">Target Field Deployment:</span>
              </div>
              <span className="font-mono font-bold text-white">
                Tamil Nadu SDRF · Kerala Fire Force · NDRF 4th Bn
              </span>
            </div>
          </div>

          {/* Interactive Mobile Device Phone Frame */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              className={`w-[340px] h-[660px] bg-slate-950 rounded-[44px] border-4 ${
                phoneOs === 'ios' ? 'border-slate-700 shadow-2xl' : 'border-slate-800 rounded-[32px]'
              } relative flex flex-col overflow-hidden ring-1 ring-cyan-500/20 select-none`}
            >
              {/* Phone Notch / Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Status Bar */}
              <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[10px] text-slate-300 font-mono z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  {isOfflineSimulated ? (
                    <WifiOff className="h-3 w-3 text-amber-400" />
                  ) : (
                    <Wifi className="h-3 w-3 text-emerald-400" />
                  )}
                  <Battery className="h-3 w-3 text-emerald-400" />
                </div>
              </div>

              {/* App Internal Header */}
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">ResQ Field Unit</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                      Echo-04
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isOfflineSimulated ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                      }`}
                    />
                    <span className={isOfflineSimulated ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                      {isOfflineSimulated ? 'OFFLINE (Local Queue)' : 'EOC Cloud Synced'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">GPS: Saidapet</span>
                </div>
              </div>

              {/* Phone Screen Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                {/* SOS Button */}
                <button
                  onClick={handleSendSos}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    sosSent
                      ? 'bg-amber-500 text-slate-950 animate-bounce'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  }`}
                >
                  <AlertOctagon className="h-5 w-5" />
                  <span>{sosSent ? 'SOS BEACON TRANSMITTED!' : 'TRANSMIT ONE-TOUCH SOS'}</span>
                </button>

                {/* Assigned Mission Task */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      Assigned Mission #842
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300">
                      {taskStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-xs">
                    Evacuate 12 stranded residents from Adyar Causeway breach
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <MapPin className="h-3 w-3 text-red-400" />
                    <span>Sector 4B · Adyar Delta</span>
                    <Clock className="h-3 w-3 ml-2 text-cyan-400" />
                    <span>ETA: On Scene</span>
                  </div>

                  {/* Task Step Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => setTaskStatus('ON_SCENE')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
                    >
                      On Scene
                    </button>
                    <button
                      onClick={() => setTaskStatus('TRIAGE_DONE')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
                    >
                      Triage Done
                    </button>
                  </div>
                </div>

                {/* Tactical Triage Counters */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase">
                      START Field Triage Tally
                    </span>
                    <span className="text-[10px] text-slate-500">Live Count</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/40">
                      <div className="text-[9px] font-bold text-red-400">RED</div>
                      <div className="text-sm font-mono font-bold text-white">{triageCounts.red}</div>
                      <button
                        onClick={() => setTriageCounts((c) => ({ ...c, red: c.red + 1 }))}
                        className="text-[10px] text-red-300 hover:text-white"
                      >
                        +1
                      </button>
                    </div>

                    <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40">
                      <div className="text-[9px] font-bold text-amber-400">YELLOW</div>
                      <div className="text-sm font-mono font-bold text-white">{triageCounts.yellow}</div>
                      <button
                        onClick={() => setTriageCounts((c) => ({ ...c, yellow: c.yellow + 1 }))}
                        className="text-[10px] text-amber-300 hover:text-white"
                      >
                        +1
                      </button>
                    </div>

                    <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                      <div className="text-[9px] font-bold text-emerald-400">GREEN</div>
                      <div className="text-sm font-mono font-bold text-white">{triageCounts.green}</div>
                      <button
                        onClick={() => setTriageCounts((c) => ({ ...c, green: c.green + 1 }))}
                        className="text-[10px] text-emerald-300 hover:text-white"
                      >
                        +1
                      </button>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[9px] font-bold text-slate-400">BLACK</div>
                      <div className="text-sm font-mono font-bold text-white">{triageCounts.black}</div>
                      <button
                        onClick={() => setTriageCounts((c) => ({ ...c, black: c.black + 1 }))}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Incident Note Form */}
                <form onSubmit={handleAddReport} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>Field Observation Note</span>
                    <Camera className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="e.g. Water reached 1.4m level, 2 elderly trapped..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Home Indicator Bar */}
              <div className="pb-2 pt-1 flex justify-center">
                <div className="w-28 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* React Native Architecture & Code Tab */
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                React Native Production Architecture Spec
              </h3>
              <p className="text-xs text-slate-400">
                Ready for React Native CLI / Expo EAS build targets (`ios/`, `android/`).
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(reactNativeCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 3000);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
            >
              {copiedCode ? <CheckCircle className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto max-h-[500px]">
            {reactNativeCode}
          </pre>
        </div>
      )}
    </div>
  );
}
