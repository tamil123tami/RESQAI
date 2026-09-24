/**
 * Voice-Based AI Command & Audio Synthesis Service
 * Implements Roadmap Item #9: Voice-based AI commands for hands-free field ops
 *
 * Utilizes the native Web Speech API (SpeechRecognition + SpeechSynthesis)
 * to provide touch-free voice dispatch, status inquiries, and spoken AI tactical feedback.
 */

class VoiceCommandService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isContinuous = false;
    this.isSupported = false;
    this.voiceSynthSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.listeners = new Set();
    this.audioContext = null;
    this.analyser = null;
    this.isSpeaking = false;
    this.enableAutoSpeakIntent = false; // When false, AI Copilot manages response speech
    this.currentTranscript = '';
    this.silenceTimeout = null;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN'; // Indian English recognition

        this.recognition.onstart = () => {
          this.isListening = true;
          this.currentTranscript = '';
          this.notify({ type: 'start' });
        };

        this.recognition.onresult = (event) => {
          // Guard: if AI assistant is currently speaking via TTS, discard incoming audio to prevent feedback loop
          if (this.isSpeaking) return;

          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = 0; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          const combined = (finalTranscript + ' ' + interimTranscript).replace(/\s+/g, ' ').trim();
          this.currentTranscript = combined;

          this.notify({
            type: 'result',
            interim: interimTranscript.trim(),
            final: finalTranscript.trim(),
            full: combined,
          });

          // Debounce silence timer: if user pauses speaking for 1.6s, finalize speech
          if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
          if (combined && combined.length > 2) {
            this.silenceTimeout = setTimeout(() => {
              if (this.isListening && this.currentTranscript) {
                const textToSend = this.currentTranscript;
                this.currentTranscript = '';
                this.stopListening();
                this.notify({ type: 'speech_finalized', text: textToSend });
              }
            }, 1600);
          }
        };

        this.recognition.onerror = (event) => {
          if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
          this.notify({ type: 'error', error: event.error });
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
          
          if (this.currentTranscript && this.currentTranscript.length > 2) {
            const textToSend = this.currentTranscript;
            this.currentTranscript = '';
            this.notify({ type: 'speech_finalized', text: textToSend });
          }

          this.notify({ type: 'end' });
        };
      }
    }
  }

  startListening(continuous = false) {
    if (!this.isSupported) return;
    if (this.isSpeaking) {
      this.stopSpeaking();
    }
    this.isContinuous = continuous;
    if (this.isListening) return;
    try {
      this.currentTranscript = '';
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
    }
  }

  stopListening() {
    this.isContinuous = false;
    if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
    if (!this.isSupported || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn('Speech recognition stop failed:', e);
    }
  }

  toggleContinuousListening() {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      this.startListening(false);
      return true;
    }
  }

  /**
   * Speak tactical audio response back to the commander or field responder
   */
  speakText(text, onEnd) {
    if (!this.voiceSynthSupported) {
      if (onEnd) onEnd();
      return;
    }
    try {
      if (this.isListening) {
        this.stopListening();
      }
      window.speechSynthesis.cancel(); // Stop any pending utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';

      this.isSpeaking = true;
      this.notify({ type: 'speaking_start', text });

      // Pick Indian English or English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.includes('en-IN') || v.name.includes('India')) || voices.find((v) => v.lang.includes('en'));
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.notify({ type: 'speaking_end' });
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.notify({ type: 'speaking_end' });
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (this.voiceSynthSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Speech cancellation failed:', e);
      }
    }
    this.isSpeaking = false;
    this.notify({ type: 'speaking_end' });
  }

  cleanTextForSpeech(text) {
    if (!text) return '';
    return text
      .replace(/[*#_`~>]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/•/g, ', ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.warn('Voice event listener error:', err);
      }
    });
  }

  toggleAssistant() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resqai_toggle_voice_assistant'));
    }
  }

  openAssistant() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resqai_open_voice_assistant'));
    }
  }

  /**
   * Parse high-level tactical intent from voice query for hands-free ops
   */
  parseTacticalIntent(transcript) {
    const q = transcript.toLowerCase();

    // 0. Voice Navigation Commands Across System
    if (q.includes('map') || q.includes('gis') || q.includes('flood map') || q.includes('show location')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/map',
        reply: 'Navigating to GIS Disaster Map and live inundation tracker.',
        category: 'navigation'
      };
    }
    if (q.includes('telemetry') || q.includes('sensor') || q.includes('live data') || q.includes('stream')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/dams',
        reply: 'Opening Live 1-Minute Reservoir Hydrology and Dam Telemetry Center.',
        category: 'navigation'
      };
    }
    if (q.includes('mobile') || q.includes('field app') || q.includes('responder app')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/mobile',
        reply: 'Opening Field Responder Mobile Operations Console.',
        category: 'navigation'
      };
    }
    if (q.includes('dam') || q.includes('reservoir') || q.includes('water level') || q.includes('mettur') || q.includes('bhavanisagar')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/dams',
        reply: 'Opening Live 1-Minute Reservoir Hydrology and Dam Telemetry for Tamil Nadu and Kerala basins.',
        category: 'navigation'
      };
    }
    if (q.includes('alert') || q.includes('warning') || q.includes('broadcast')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/alerts',
        reply: 'Opening Active Alerts and CAP Emergency Broadcasts.',
        category: 'navigation'
      };
    }
    if (q.includes('hospital') || q.includes('doctor') || q.includes('trauma') || q.includes('icu bed')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/hospitals',
        reply: 'Routing to Regional Hospital Directory and Emergency Trauma Bed Status.',
        category: 'navigation'
      };
    }
    if (q.includes('team') || q.includes('battalion') || q.includes('squad') || q.includes('crew')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/teams',
        reply: 'Reviewing NDRF and SDRF Battalion Deployment Status.',
        category: 'navigation'
      };
    }
    if (q.includes('task') || q.includes('operation') || q.includes('mission')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/tasks',
        reply: 'Opening Field Operations and Emergency Tasks Console.',
        category: 'navigation'
      };
    }
    if (q.includes('business') || q.includes('roi') || q.includes('commercial') || q.includes('monetization')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/reports',
        reply: 'Opening Enterprise Operations, Government SDRF Relief and InsurTech Claim Dossiers.',
        category: 'navigation'
      };
    }
    if (q.includes('dashboard') || q.includes('home') || q.includes('main screen') || q.includes('overview')) {
      return {
        action: 'NAVIGATE_PAGE',
        path: '/',
        reply: 'Returning to Main Emergency Operations Center Command Dashboard.',
        category: 'navigation'
      };
    }

    // 1. Emergency SOS & Distress Beacon
    if (q.includes('sos') || q.includes('mayday') || q.includes('distress') || q.includes('officer down') || q.includes('emergency beacon') || q.includes('urgent backup')) {
      return {
        action: 'TRIGGER_SOS',
        reply: 'Emergency distress beacon activated! Broadcasting priority SOS with GPS coordinates to State EOC and nearest NDRF squad.',
        category: 'distress',
        params: { urgency: 'CRITICAL_IMMEDIATE' }
      };
    }

    // 2. Field Triage Logging (START Protocol)
    // Red / Immediate
    if (q.includes('red') && (q.includes('triage') || q.includes('victim') || q.includes('casualty') || q.includes('count') || q.includes('critical') || q.includes('add') || q.includes('plus'))) {
      const matchNum = q.match(/\b(\d+)\b/);
      const count = matchNum ? parseInt(matchNum[1], 10) : 1;
      return {
        action: 'LOG_TRIAGE',
        triageType: 'red',
        count,
        reply: `Logged ${count} critical red priority casualty. Alerting regional trauma center for immediate resuscitation.`,
        category: 'triage',
      };
    }

    // Yellow / Delayed
    if (q.includes('yellow') && (q.includes('triage') || q.includes('victim') || q.includes('casualty') || q.includes('count') || q.includes('moderate') || q.includes('add') || q.includes('plus'))) {
      const matchNum = q.match(/\b(\d+)\b/);
      const count = matchNum ? parseInt(matchNum[1], 10) : 1;
      return {
        action: 'LOG_TRIAGE',
        triageType: 'yellow',
        count,
        reply: `Logged ${count} delayed yellow priority casualty. Hospital bed allocation updated.`,
        category: 'triage',
      };
    }

    // Green / Minor
    if (q.includes('green') && (q.includes('triage') || q.includes('victim') || q.includes('casualty') || q.includes('walking') || q.includes('add') || q.includes('plus'))) {
      const matchNum = q.match(/\b(\d+)\b/);
      const count = matchNum ? parseInt(matchNum[1], 10) : 1;
      return {
        action: 'LOG_TRIAGE',
        triageType: 'green',
        count,
        reply: `Logged ${count} minor green priority walking wounded to field relief station.`,
        category: 'triage',
      };
    }

    // Black / Expectant
    if (q.includes('black') && (q.includes('triage') || q.includes('victim') || q.includes('casualty') || q.includes('deceased') || q.includes('add') || q.includes('plus'))) {
      const matchNum = q.match(/\b(\d+)\b/);
      const count = matchNum ? parseInt(matchNum[1], 10) : 1;
      return {
        action: 'LOG_TRIAGE',
        triageType: 'black',
        count,
        reply: `Logged ${count} deceased black tag casualty. Mortuary affairs unit notified.`,
        category: 'triage',
      };
    }

    // 3. Mission Status Updates
    if (q.includes('arrived') || q.includes('on scene') || q.includes('at site') || q.includes('reached target')) {
      return {
        action: 'UPDATE_MISSION_STATUS',
        status: 'ON_SCENE',
        reply: 'Roger Echo Unit. Mission status marked: Arrived On Scene. Timestamp logged at Central EOC.',
        category: 'mission',
      };
    }

    if (q.includes('triage complete') || q.includes('triage finished') || q.includes('triage done') || q.includes('assessment complete')) {
      return {
        action: 'UPDATE_MISSION_STATUS',
        status: 'TRIAGE_DONE',
        reply: 'Copy that. Triage assessment marked completed. Evacuation corridors synchronized.',
        category: 'mission',
      };
    }

    if (q.includes('mission complete') || q.includes('mission accomplished') || q.includes('evacuation complete') || q.includes('clear scene')) {
      return {
        action: 'COMPLETE_MISSION',
        status: 'COMPLETED',
        reply: 'Mission concluded successfully. All team personnel logged safe, mission report filed with EOC.',
        category: 'mission',
      };
    }

    // 4. Voice Field Observation / Dictation Memo
    if (q.startsWith('report') || q.startsWith('log note') || q.startsWith('memo') || q.startsWith('note') || q.includes('field observation') || q.includes('water level') || q.includes('breach')) {
      const memoText = transcript.replace(/^(report|log note|memo|note|field note)\s*/i, '').trim() || transcript;
      return {
        action: 'ADD_FIELD_NOTE',
        note: memoText,
        reply: `Field note recorded: "${memoText.slice(0, 60)}...". Cached in local store and queued for EOC dispatch.`,
        category: 'report',
      };
    }

    // 5. Sitrep & Situation Inquiries
    if (q.includes('sitrep') || q.includes('status report') || q.includes('situation report') || q.includes('what is my mission') || q.includes('current mission')) {
      return {
        action: 'GET_SITREP',
        reply: 'SITREP: Echo Unit 04 operating in Sector 4B Adyar Delta. Weather: Heavy Deluge. Mission #842 Active.',
        category: 'sitrep',
      };
    }

    // 6. Nearest Hospital & Medical Evacuation Route
    if (q.includes('hospital') || q.includes('doctor') || q.includes('ambulance') || q.includes('trauma') || q.includes('medical facility')) {
      return {
        action: 'GET_HOSPITAL',
        reply: 'Routing to nearest facility: Government General Hospital Chennai, 2.4 kilometers out. 18 ICU beds available.',
        category: 'medical',
      };
    }

    // 7. Network Blackout & Offline Mode
    if (q.includes('offline') || q.includes('blackout') || q.includes('disconnect') || q.includes('no signal')) {
      return {
        action: 'TOGGLE_OFFLINE',
        reply: 'Disaster zone communications blackout simulated. Switched to on-device offline storage.',
        category: 'network',
      };
    }

    if (q.includes('online') || q.includes('reconnect') || q.includes('sync queue') || q.includes('upload data')) {
      return {
        action: 'TOGGLE_ONLINE',
        reply: 'Network link restored. Synchronizing queued field reports and triage counts to central EOC.',
        category: 'network',
      };
    }

    // 8. Failover Drill
    if (q.includes('failover') || (q.includes('kill') && q.includes('controller')) || q.includes('heartbeat')) {
      return {
        action: 'TRIGGER_FAILOVER',
        reply: 'Initiating controller heartbeat failover drill. Standby DR node promoted to leader in 2.8 seconds.',
        category: 'ops',
      };
    }

    // 9. Aerial Drone Surveillance
    if (q.includes('drone') || q.includes('uav') || q.includes('aerial')) {
      return {
        action: 'SHOW_DRONE',
        reply: 'Switching tactical feed to autonomous UAV Squadron Echo 1 patrolling Adyar Delta Basin.',
        category: 'telemetry',
      };
    }

    // 10. Satellite SAR Flood Inundation
    if (q.includes('satellite') || q.includes('sar') || q.includes('inundation')) {
      return {
        action: 'SHOW_SATELLITE',
        reply: 'Activating Sentinel-1 SAR flood inundation radar telemetry overlay.',
        category: 'telemetry',
      };
    }

    // 11. Dam Telemetry
    if (q.includes('dam') || q.includes('reservoir') || q.includes('water level')) {
      return {
        action: 'CHECK_DAMS',
        reply: 'Retrieving multi-state reservoir telemetry: Chembarambakkam at 84% capacity, outflow 1,200 cusecs.',
        category: 'telemetry',
      };
    }

    // 12. NDMA & NDRF Battalions
    if (q.includes('ndma') || q.includes('battalion') || q.includes('national')) {
      return {
        action: 'CHECK_NDMA',
        reply: 'Querying NDMA Central Command. 4th Arakkonam and 10th NDRF Battalions deployed on standby.',
        category: 'ops',
      };
    }

    // 13. Deluge ML Prediction
    if (q.includes('predict') || q.includes('forecast') || q.includes('hydrograph')) {
      return {
        action: 'RUN_PREDICTION',
        reply: 'Executing ML hydrological deluge projection using historical deluge datasets. Crest expected in 4 hours.',
        category: 'prediction',
      };
    }

    return null;
  }
}

export const voiceCommandService = new VoiceCommandService();

