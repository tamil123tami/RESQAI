import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { VoiceOpsService } from '../services/VoiceOpsService';
import { OfflineStorageService } from '../services/OfflineStorageService';

export default function VoiceCommanderScreen() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [tacticalLogs, setTacticalLogs] = useState([
    {
      id: '1',
      time: '09:35',
      user: 'Echo Unit 04',
      command: 'Arrived at Saidapet Bridge causeway',
      response: 'Roger Echo Unit. Timestamp logged on scene at Adyar Delta breach.',
      type: 'mission',
    },
    {
      id: '2',
      time: '09:38',
      user: 'Echo Unit 04',
      command: 'Triage Red 2 yellow 4',
      response: 'Logged 2 critical red and 4 delayed yellow priority casualties.',
      type: 'triage',
    },
  ]);

  const handleSimulateVoiceCommand = async (spokenText) => {
    setTranscript(spokenText);
    setIsListening(true);
    await VoiceOpsService.triggerHaptic('medium');

    setTimeout(async () => {
      setIsListening(false);
      const parsed = VoiceOpsService.parseSpokenQuery(spokenText);

      // Play synthesized audio voice feedback
      await VoiceOpsService.speakTacticalResponse(parsed.reply);

      // Log action locally
      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Echo Unit 04',
        command: spokenText,
        response: parsed.reply,
        type: parsed.action,
      };

      setTacticalLogs((prev) => [newLog, ...prev]);

      // Cache to offline action queue
      await OfflineStorageService.enqueueAction('VOICE_COMMAND_LOG', {
        command: spokenText,
        action: parsed.action,
        reply: parsed.reply,
        timestamp: new Date().toISOString(),
      });
    }, 600);
  };

  const presetCommands = [
    { label: '🚨 Mayday Distress SOS', query: 'Mayday emergency distress beacon officer in water' },
    { label: '🔴 Log 2 Red Casualties', query: 'Triage red 2 critical victims' },
    { label: '🟡 Log 3 Yellow Casualties', query: 'Triage yellow 3 moderate lacerations' },
    { label: '📍 Unit Arrived On Scene', query: 'Echo unit arrived on scene at breach' },
    { label: '✅ Triage Complete', query: 'Triage assessment complete ready for transport' },
    { label: '🏥 Nearest Hospital Route', query: 'Nearest hospital with open trauma beds' },
    { label: '📡 Mission Sitrep', query: 'Give me sitrep for mission 842' },
    { label: '📝 Memo: Water at 1.8m', query: 'Report water level reached 1.8 meters swift current' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Hands-Free AI Voice Commander</Text>
        <Text style={styles.subtitle}>
          Touch-Free Tactical Dispatch & Audio-Synthesized Operations
        </Text>
      </View>

      {/* Mic Animation & Push-To-Talk Card */}
      <View style={styles.micCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSimulateVoiceCommand('Echo unit arrived on scene at Saidapet breach')}
          style={[styles.micButton, isListening && styles.micButtonListening]}
        >
          <Text style={styles.micIcon}>🎙️</Text>
          <Text style={styles.micState}>
            {isListening ? 'LISTENING (HANDS-FREE ACTIVE)...' : 'TAP TO TRANSMIT VOICE COMMAND'}
          </Text>
        </TouchableOpacity>

        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>LAST SPOKEN AUDIO:</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        ) : null}
      </View>

      {/* Tactical Quick Preset Commands */}
      <Text style={styles.sectionHeader}>Tactical Hands-Free Presets:</Text>
      <View style={styles.presetGrid}>
        {presetCommands.map((cmd, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.presetBtn}
            onPress={() => handleSimulateVoiceCommand(cmd.query)}
          >
            <Text style={styles.presetBtnText}>{cmd.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Voice Ops Activity Log */}
      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Voice Dispatch & EOC Comm Log:</Text>
      <View style={styles.logsList}>
        {tacticalLogs.map((log) => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logHeader}>
              <Text style={styles.logUser}>{log.user} · {log.time}</Text>
              <Text style={styles.logType}>{log.type}</Text>
            </View>
            <Text style={styles.logSpoken}>"{log.command}"</Text>
            <View style={styles.responseBox}>
              <Text style={styles.responseIcon}>🔊</Text>
              <Text style={styles.responseText}>{log.response}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  micCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  micButton: {
    backgroundColor: '#0891b2',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonListening: {
    backgroundColor: '#dc2626',
  },
  micIcon: { fontSize: 36, marginBottom: 6 },
  micState: { color: '#ffffff', fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  transcriptBox: {
    marginTop: 14,
    backgroundColor: '#030712',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  transcriptLabel: { color: '#06b6d4', fontSize: 9, fontWeight: '800', marginBottom: 2 },
  transcriptText: { color: '#ffffff', fontSize: 13, fontStyle: 'italic' },
  sectionHeader: { color: '#94a3b8', fontSize: 12, fontWeight: '800', marginBottom: 10, letterSpacing: 0.5 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  presetBtnText: { color: '#e2e8f0', fontSize: 11, fontWeight: '700' },
  logsList: { gap: 10 },
  logItem: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logUser: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  logType: { color: '#06b6d4', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  logSpoken: { color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  responseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891b218',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  responseIcon: { fontSize: 14 },
  responseText: { color: '#22d3ee', fontSize: 11, fontWeight: '600', flex: 1 },
});
