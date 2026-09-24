import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { OfflineStorageService } from '../services/OfflineStorageService';
import { LocationTelemetryService } from '../services/LocationTelemetryService';
import { VoiceOpsService } from '../services/VoiceOpsService';

export default function FieldDashboardScreen({ isConnected, onNavigateTab }) {
  const [coords, setCoords] = useState({ latitude: 13.0182, longitude: 80.2215 });
  const [missionStatus, setMissionStatus] = useState('ARRIVED_ON_SCENE');
  const [sosActive, setSosActive] = useState(false);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  useEffect(() => {
    (async () => {
      const pos = await LocationTelemetryService.getCurrentPosition();
      setCoords(pos);
      const queue = await OfflineStorageService.getQueue();
      setPendingQueueCount(queue.length);
    })();
  }, []);

  const handleTriggerSOS = async () => {
    setSosActive(true);
    await VoiceOpsService.triggerHaptic('sos');
    await VoiceOpsService.speakTacticalResponse('Distress beacon initiated. Transmitting GPS coordinates to State EOC.');

    const payload = {
      unitId: 'Echo-Unit-04',
      officer: 'Sub-Inspector R. Ramesh',
      latitude: coords.latitude,
      longitude: coords.longitude,
      urgency: 'CRITICAL_IMMEDIATE',
      timestamp: new Date().toISOString(),
    };

    await OfflineStorageService.enqueueAction('SOS_DISTRESS_BEACON', payload);
    const updatedQueue = await OfflineStorageService.getQueue();
    setPendingQueueCount(updatedQueue.length);

    Alert.alert(
      '🚨 SOS TRANSMITTED',
      `Emergency distress coordinates (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}) flagged for immediate air/boat extraction.`
    );

    setTimeout(() => setSosActive(false), 3000);
  };

  const handleUpdateStatus = async (status) => {
    setMissionStatus(status);
    await VoiceOpsService.triggerHaptic('medium');
    await VoiceOpsService.speakTacticalResponse(`Status updated to ${status.replace(/_/g, ' ')}`);

    await OfflineStorageService.enqueueAction('MISSION_STATUS_UPDATE', {
      unitId: 'Echo-Unit-04',
      status,
      timestamp: new Date().toISOString(),
    });
    const updatedQueue = await OfflineStorageService.getQueue();
    setPendingQueueCount(updatedQueue.length);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner Status */}
      <View style={styles.telemetryCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.unitBadge}>ECHO UNIT 04 · SDRF BATTALION</Text>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#f59e0b' }]} />
        </View>

        <Text style={styles.locationTitle}>Saidapet Bridge · Adyar Basin</Text>
        <Text style={styles.coordsText}>
          GPS: {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E · Alt: 12m
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.syncStatus}>
            {isConnected ? '● Connected: State EOC Cloud' : '▲ Offline Mode: Local Queue Active'}
          </Text>
          {pendingQueueCount > 0 && (
            <Text style={styles.queuePill}>{pendingQueueCount} queued</Text>
          )}
        </View>
      </View>

      {/* Primary One-Touch SOS Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleTriggerSOS}
        style={[styles.sosButton, sosActive && styles.sosButtonActive]}
      >
        <Text style={styles.sosIcon}>🚨</Text>
        <Text style={styles.sosText}>
          {sosActive ? 'DISTRESS BEACON TRANSMITTING...' : 'ONE-TOUCH DISTRESS SOS'}
        </Text>
        <Text style={styles.sosSubtext}>Instant high-priority beacon to NDRF & State Command</Text>
      </TouchableOpacity>

      {/* Active Mission Details */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeader}>ACTIVE MISSION #842</Text>
          <Text style={styles.missionPill}>{missionStatus.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.missionDesc}>
          Evacuate 12 stranded residents from Adyar Causeway breach before flood crest.
        </Text>

        <Text style={styles.subhead}>Update Tactical Progress:</Text>
        <View style={styles.statusButtonGroup}>
          <TouchableOpacity
            style={[styles.statusBtn, missionStatus === 'EN_ROUTE' && styles.statusBtnActive]}
            onPress={() => handleUpdateStatus('EN_ROUTE')}
          >
            <Text style={styles.statusBtnText}>En Route</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, missionStatus === 'ON_SCENE' && styles.statusBtnActive]}
            onPress={() => handleUpdateStatus('ON_SCENE')}
          >
            <Text style={styles.statusBtnText}>On Scene</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, missionStatus === 'TRIAGE_DONE' && styles.statusBtnActive]}
            onPress={() => handleUpdateStatus('TRIAGE_DONE')}
          >
            <Text style={styles.statusBtnText}>Triage Done</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, missionStatus === 'COMPLETED' && styles.statusBtnActive]}
            onPress={() => handleUpdateStatus('COMPLETED')}
          >
            <Text style={styles.statusBtnText}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Launch Cards */}
      <View style={styles.gridRow}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onNavigateTab('voice')}
        >
          <Text style={styles.gridIcon}>🎙️</Text>
          <Text style={styles.gridTitle}>Hands-Free Voice</Text>
          <Text style={styles.gridDesc}>Voice-dispatch & hands-free triage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onNavigateTab('triage')}
        >
          <Text style={styles.gridIcon}>🏥</Text>
          <Text style={styles.gridTitle}>START Triage</Text>
          <Text style={styles.gridDesc}>Red/Yellow/Green victim tally</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  content: { padding: 16, paddingBottom: 40 },
  telemetryCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  unitBadge: { color: '#06b6d4', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  locationTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700', marginBottom: 2 },
  coordsText: { color: '#94a3b8', fontSize: 12, fontFamily: 'monospace', marginBottom: 8 },
  syncStatus: { color: '#10b981', fontSize: 11, fontWeight: '600' },
  queuePill: {
    backgroundColor: '#f59e0b22',
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sosButton: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  sosButtonActive: {
    backgroundColor: '#b91c1c',
    transform: [{ scale: 0.98 }],
  },
  sosIcon: { fontSize: 32, marginBottom: 4 },
  sosText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 1.2 },
  sosSubtext: { color: '#fecaca', fontSize: 11, marginTop: 4 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHeader: { color: '#06b6d4', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  missionPill: {
    backgroundColor: '#3b82f622',
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  missionDesc: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginVertical: 8, lineHeight: 20 },
  subhead: { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  statusButtonGroup: { flexDirection: 'row', gap: 6 },
  statusBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusBtnActive: { backgroundColor: '#0891b2' },
  statusBtnText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  gridIcon: { fontSize: 24, marginBottom: 6 },
  gridTitle: { color: '#ffffff', fontSize: 13, fontWeight: '700', marginBottom: 2 },
  gridDesc: { color: '#64748b', fontSize: 11, lineHeight: 15 },
});
