import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  MapPin,
  X,
  Activity,
  AlertOctagon,
  Navigation,
  Droplets,
  Shield,
  Layers,
  HeartPulse,
  Smartphone,
  ChevronUp,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { voiceCommandService } from '../../services/voiceCommandService';
import { resolveDashboardKnowledge } from '../../services/dashboardKnowledgeService';

export default function AIVoiceAssistant() {
  const navigate = useNavigate();
  const {
    disasters,
    teams,
    hospitals,
    sosBeacons,
    addSOSBeacon,
    getStats,
    showNotification,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('ResQ Voice Assistant initialized. Say a command or select a quick tactical trigger.');
  const [lastIntent, setLastIntent] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [commandHistory, setCommandHistory] = useState([
    {
      id: 'init-1',
      time: '09:30:00',
      command: 'Voice AI Subsystem Online',
      reply: 'Voice command processor ready for hands-free EOC operations.',
      category: 'system',
    },
  ]);

  const historyEndRef = useRef(null);

  // ── Global Event Listeners & Keyboard Shortcut ─────────────────────────────
  useEffect(() => {
    const handleToggleEvent = () => {
      setIsOpen((prev) => !prev);
      if (!isListening) {
        voiceCommandService.startListening(continuousMode);
      }
    };

    const handleOpenEvent = () => {
      setIsOpen(true);
      voiceCommandService.startListening(continuousMode);
    };

    const handleKeyDown = (e) => {
      // Alt + V shortcut to trigger Voice Assistant
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setIsOpen(true);
        if (isListening) {
          voiceCommandService.stopListening();
        } else {
          voiceCommandService.startListening(continuousMode);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resqai_toggle_voice_assistant', handleToggleEvent);
      window.addEventListener('resqai_open_voice_assistant', handleOpenEvent);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resqai_toggle_voice_assistant', handleToggleEvent);
        window.removeEventListener('resqai_open_voice_assistant', handleOpenEvent);
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isListening, continuousMode]);

  // ── Subscribe to voiceCommandService ──────────────────────────────────────
  useEffect(() => {
    const unsub = voiceCommandService.subscribe((event) => {
      if (event.type === 'start') {
        setIsListening(true);
      } else if (event.type === 'end') {
        setIsListening(false);
      } else if (event.type === 'speaking_start') {
        setIsSpeaking(true);
      } else if (event.type === 'speaking_end') {
        setIsSpeaking(false);
      } else if (event.type === 'result') {
        setInterimText(event.full || event.interim || "");
      } else if (event.type === 'speech_finalized') {
        setInterimText("");
        setFinalTranscript(event.text);
        const parsedIntent = voiceCommandService.parseTacticalIntent(event.text);
        if (parsedIntent) {
          handleExecuteVoiceIntent(parsedIntent, event.text);
        } else {
          handleGenericCommand(event.text);
        }
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disasters, teams, hospitals, sosBeacons]);

  // ── Tactical Intent Handler ───────────────────────────────────────────────
  const handleExecuteVoiceIntent = (intent, queryText) => {
    setLastIntent(intent);
    const replyText = intent.reply;
    setLastResponse(replyText);

    // Speak audio reply if not muted
    if (!audioMuted) {
      voiceCommandService.speakText(replyText);
    }

    // 1. Navigation Actions
    if (intent.action === 'NAVIGATE_PAGE' && intent.path) {
      navigate(intent.path);
      showNotification({
        id: Date.now(),
        type: 'info',
        title: 'VOICE NAVIGATION',
        message: `Voice Assistant routed to ${intent.path}`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. SOS Distress Beacon
    if (intent.action === 'TRIGGER_SOS') {
      addSOSBeacon({
        senderName: 'Voice Assistant Trigger (EOC Command)',
        phone: '+91-98840-00112',
        areaName: 'Saidapet Delta Zone',
        lat: 13.0182,
        lng: 80.2215,
        message: 'EMERGENCY BEACON LOGGED VIA VOICE ASSISTANT: Immediate ground & boat teams requested.',
        severity: 'critical',
      });
    }

    // 3. Situation Report (SITREP) Generation
    if (intent.action === 'GET_SITREP') {
      const stats = getStats();
      const activeCount = stats.activeDisasters;
      const deployed = stats.deployedTeams;
      const dynamicSitrep = `SITREP ACTIVE: ${activeCount} active disaster zones, ${deployed} tactical teams deployed on scene. Overall regional deluge risk at ${stats.overallRiskPercent} percent.`;
      setLastResponse(dynamicSitrep);
      if (!audioMuted) {
        voiceCommandService.speakText(dynamicSitrep);
      }
    }

    // 4. Hospital Telemetry
    if (intent.action === 'GET_HOSPITAL') {
      const nearest = hospitals && hospitals[0] ? hospitals[0] : null;
      if (nearest) {
        const hospReply = `Nearest trauma facility is ${nearest.name}, ${nearest.distance ? nearest.distance.toFixed(1) : '2.4'} kilometers away with ${nearest.icuBeds || 18} ICU beds available.`;
        setLastResponse(hospReply);
        if (!audioMuted) {
          voiceCommandService.speakText(hospReply);
        }
      }
    }

    // Append to Command History
    setCommandHistory((prev) => [
      {
        id: `cmd-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        command: queryText,
        reply: replyText,
        category: intent.category || 'ops',
      },
      ...prev,
    ]);
  };

  // ── Generic Fallback Command Parser ───────────────────────────────────────
  const handleGenericCommand = async (queryText) => {
    const q = queryText.toLowerCase();

    // First resolve against comprehensive dashboard knowledge (dams, weather, areas, teams, hospitals, SOS)
    const knowledge = await resolveDashboardKnowledge(queryText, {
      disasters,
      teams,
      hospitals,
      sosBeacons,
      stats: getStats(),
    });

    let reply = "";
    let spoken = "";

    if (knowledge && knowledge.matched) {
      reply = knowledge.answer;
      spoken = knowledge.spokenSummary;
    } else {
      reply = `Recognized command: "${queryText}". Routing to AI Decision Engine.`;

      if (q.includes('dams') || q.includes('water level')) {
        navigate('/dams');
        reply = 'Navigating to Dam Water Levels and Reservoir Telemetry.';
      } else if (q.includes('map') || q.includes('inundation')) {
        navigate('/map');
        reply = 'Switching to GIS Flood Map.';
      } else if (q.includes('telemetry') || q.includes('sensor')) {
        navigate('/dams');
        reply = 'Opening Live 1-Minute Dam Hydrology and Reservoir Telemetry.';
      } else if (q.includes('mobile') || q.includes('field app')) {
        navigate('/mobile');
        reply = 'Opening Field Responder Mobile Companion.';
      } else if (q.includes('alert')) {
        navigate('/alerts');
        reply = 'Accessing Emergency Alerts.';
      }
      spoken = reply;
    }

    setLastResponse(reply);
    if (!audioMuted) {
      voiceCommandService.speakText(spoken);
    }

    setCommandHistory((prev) => [
      {
        id: `cmd-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        command: queryText,
        reply,
        category: knowledge?.category || 'general',
      },
      ...prev,
    ]);
  };

  // ── 1-Click Simulation Triggers ───────────────────────────────────────────
  const triggerPresetPrompt = async (query) => {
    setFinalTranscript(query);
    const parsedIntent = voiceCommandService.parseTacticalIntent(query);
    if (parsedIntent) {
      handleExecuteVoiceIntent(parsedIntent, query);
    } else {
      await handleGenericCommand(query);
    }
  };

  const presetQueries = [
    { label: '🌊 Mettur Dam Level', query: 'What is the current water level and inflow of Mettur Dam?', icon: Droplets },
    { label: '🌦️ Chennai Weather', query: 'What is the live weather forecast for Chennai?', icon: Activity },
    { label: '📍 Velachery Disasters', query: 'Are there any active flood disasters reported in Velachery?', icon: MapPin },
    { label: '🗺️ Show Live Map', query: 'Show disaster GIS map', icon: MapPin },
    { label: '📋 Tactical Sitrep', query: 'Give me a sitrep of active emergencies', icon: Sparkles },
    { label: '🚨 Mayday SOS Beacon', query: 'Mayday emergency distress beacon', icon: AlertOctagon },
    { label: '🏥 Nearest Hospital', query: 'Nearest hospital with trauma ICU beds', icon: Navigation },
    { label: '📱 Mobile Field App', query: 'Open field responder mobile companion', icon: Smartphone },
  ];

  return (
    <>
      {/* ─── Persistent Floating AI Voice Orb ───────────────────────────── */}
      <div className="fixed bottom-6 right-24 z-50 flex items-center gap-2 select-none print:hidden">
        {/* Expanded Status Pill when hovering/speaking */}
        {(isListening || isSpeaking) && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md animate-pulse">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{isSpeaking ? 'Voice AI Speaking...' : 'Voice AI Listening...'}</span>
          </div>
        )}

        {/* Floating Voice Button */}
        <button
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            if (next && !isListening) {
              voiceCommandService.startListening(continuousMode);
            }
          }}
          className={`relative group h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
            isListening
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white ring-4 ring-red-500/40 animate-pulse shadow-red-600/50'
              : isSpeaking
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white ring-4 ring-cyan-500/40 shadow-cyan-500/50'
              : 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:scale-105 shadow-purple-600/40 hover:shadow-purple-600/60 ring-2 ring-purple-400/30'
          }`}
          title="ResQ AI Voice Assistant (Alt + V)"
        >
          {/* Animated concentric pulse wave */}
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
          )}
          {isSpeaking && (
            <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
          )}

          {isListening ? (
            <Mic className="h-6 w-6 relative z-10" />
          ) : isSpeaking ? (
            <Volume2 className="h-6 w-6 relative z-10 animate-bounce" />
          ) : (
            <Sparkles className="h-6 w-6 relative z-10" />
          )}

          {/* Mini Badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isListening ? 'bg-red-400' : 'bg-cyan-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-4 w-4 ${isListening ? 'bg-red-500' : 'bg-cyan-500'} text-[8px] font-black items-center justify-center text-white`}>
              AI
            </span>
          </span>
        </button>
      </div>

      {/* ─── Interactive Holographic Voice Command Center Modal ──────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn print:hidden">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl shadow-purple-900/40 relative overflow-hidden">
            {/* Holographic Background Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-purple-500/20 text-purple-400'} border border-purple-500/30`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white tracking-wide">
                      ResQ AI Voice Assistant
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      v2.4 Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hands-Free Voice Commander & Tactical Audio Synthesizer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Mute/Unmute */}
                <button
                  onClick={() => {
                    const next = !audioMuted;
                    setAudioMuted(next);
                    if (next) window.speechSynthesis?.cancel();
                  }}
                  className={`p-2 rounded-xl text-xs transition-colors border ${
                    audioMuted
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title={audioMuted ? 'Unmute Audio Voice Response' : 'Mute Audio Voice Response'}
                >
                  {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Central Holographic Frequency Equalizer & Mic Trigger */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
              {/* Animated 20-Band Frequency Equalizer */}
              <div className="flex items-end justify-center gap-1.5 h-16 w-full mb-5">
                {[20, 45, 75, 30, 65, 90, 50, 25, 80, 95, 40, 70, 35, 85, 60, 30, 75, 50, 90, 40].map((barHeight, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: (isListening || isSpeaking)
                        ? `${Math.max(10, barHeight * (0.35 + Math.random() * 0.65))}px`
                        : '6px',
                      transition: 'height 0.12s ease',
                    }}
                    className={`w-1.5 rounded-full ${
                      isListening
                        ? 'bg-gradient-to-t from-red-500 to-rose-400 shadow-sm shadow-rose-400/50'
                        : isSpeaking
                        ? 'bg-gradient-to-t from-cyan-500 to-purple-400 shadow-sm shadow-cyan-400/50'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Main Central Microphone Action Button */}
              <button
                onClick={() => {
                  if (isListening) {
                    voiceCommandService.stopListening();
                  } else {
                    voiceCommandService.startListening(continuousMode);
                  }
                }}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl transition-all active:scale-95 ${
                  isListening
                    ? 'bg-red-600 text-white ring-8 ring-red-500/30 animate-pulse shadow-red-600/60'
                    : isSpeaking
                    ? 'bg-cyan-600 text-white ring-8 ring-cyan-500/30 shadow-cyan-600/50'
                    : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white hover:scale-105 shadow-purple-600/50 ring-4 ring-purple-500/20'
                }`}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : isSpeaking ? (
                  <Volume2 className="h-8 w-8 animate-bounce" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Push to Talk'}
                </span>
              </button>

              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs text-slate-400">
                  {isListening
                    ? '🎙️ Listening... Speak naturally to navigate or command the EOC.'
                    : isSpeaking
                    ? '🔊 Synthesizing and speaking tactical response...'
                    : 'Click microphone or press Alt+V to speak.'}
                </span>

                {/* Continuous Hands-Free Toggle */}
                <button
                  onClick={() => {
                    const next = !continuousMode;
                    setContinuousMode(next);
                    if (next) {
                      voiceCommandService.startListening(true);
                    } else {
                      voiceCommandService.stopListening();
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                    continuousMode
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {continuousMode ? 'Hands-Free ON' : 'Hands-Free'}
                </button>
              </div>
            </div>

            {/* Live Speech Recognition & Response Terminal */}
            <div className="space-y-2">
              {/* Spoken Query Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-cyan-400 font-mono flex items-center gap-1.5">
                    <Radio className="h-3 w-3" /> COMMANDER SPOKEN AUDIO:
                  </span>
                  {lastIntent && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      {lastIntent.action}
                    </span>
                  )}
                </div>

                <p className="text-white text-xs font-semibold italic min-h-[22px]">
                  {interimText || finalTranscript ? (
                    `"${finalTranscript || interimText}"`
                  ) : (
                    <span className="text-slate-600">Waiting for speech input...</span>
                  )}
                </p>
              </div>

              {/* AI Synthesized Response Box */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2.5">
                <Volume2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-0.5">
                    ASSISTANT AUDIO RESPONSE:
                  </span>
                  <p className="font-medium text-xs leading-relaxed">{lastResponse}</p>
                </div>
              </div>
            </div>

            {/* Quick Voice Command Triggers Matrix */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Quick Tactical Voice Commands (1-Click Test):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {presetQueries.map(({ label, query, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => triggerPresetPrompt(query)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 text-left text-slate-200 transition-all font-semibold flex items-center gap-2 group"
                  >
                    <Icon className="h-3.5 w-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate text-[11px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Command History Section */}
            <div className="border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-white"
              >
                <div className="flex items-center gap-1.5 font-mono">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Voice Command History ({commandHistory.length})</span>
                </div>
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showHistory && (
                <div className="mt-2.5 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {commandHistory.map((item) => (
                    <div key={item.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px]">
                      <div className="flex justify-between text-slate-500 font-mono mb-0.5">
                        <span className="text-cyan-400 font-bold">"{item.command}"</span>
                        <span>{item.time}</span>
                      </div>
                      <p className="text-slate-300">{item.reply}</p>
                    </div>
                  ))}
                  <div ref={historyEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
