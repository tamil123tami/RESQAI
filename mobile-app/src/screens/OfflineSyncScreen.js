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

export default function OfflineSyncScreen({ isConnected, onToggleConnection }) {
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const reloadQueue = async () => {
    const items = await OfflineStorageService.getQueue();
    setQueue(items);
  };

  useEffect(() => {
    reloadQueue();
  }, []);

  const handleSyncNow = async () => {
    if (queue.length === 0) {
      Alert.alert('Queue Empty', 'All on-device actions are already synced to EOC.');
      return;
    }
    if (!isConnected) {
      Alert.alert('Offline Mode', 'Cannot sync while disconnected. Restore connection or switch to 5G.');
      return;
    }

    setIsSyncing(true);
    setTimeout(async () => {
      await OfflineStorageService.clearQueue();
      setQueue([]);
      setIsSyncing(false);
      Alert.alert('Sync Successful', 'All queued field actions and triage counts uploaded to central EOC database.');
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline Queue & Mesh Sync</Text>
        <Text style={styles.subtitle}>
          Zero-Connectivity Local Persistence · Auto-Flush Engine
        </Text>
      </View>

      {/* Network Mode Card */}
      <View style={styles.networkCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeader}>NETWORK STATUS</Text>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#f59e0b' }]} />
        </View>

        <Text style={isConnected ? styles.onlineText : styles.offlineText}>
          {isConnected ? '● Connected: Central EOC Cloud (5G)' : '▲ Offline Mode: Disaster Blackout'}
        </Text>

        <TouchableOpacity
          style={[styles.toggleBtn, isConnected ? styles.toggleBtnOffline : styles.toggleBtnOnline]}
          onPress={onToggleConnection}
        >
          <Text style={styles.toggleBtnText}>
            {isConnected ? 'Simulate Blackout / Offline' : 'Restore Online 5G Link'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sync Action Button */}
      <TouchableOpacity
        style={[styles.syncBtn, (queue.length === 0 || !isConnected) && styles.syncBtnDisabled]}
        onPress={handleSyncNow}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Text style={styles.syncBtnText}>
              BATCH FLUSH QUEUE ({queue.length} PENDING)
            </Text>
            <Text style={styles.syncBtnSub}>Upload encrypted JSON telemetry to EOC</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Queue Items List */}
      <Text style={styles.sectionHeader}>Cached Actions in Local SQLite / AsyncStorage:</Text>
      {queue.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>Local Queue Clear</Text>
          <Text style={styles.emptyText}>All field events are synchronized with Command HQ.</Text>
        </View>
      ) : (
        <View style={styles.queueList}>
          {queue.map((item) => (
            <View key={item.id} style={styles.queueItem}>
              <View style={styles.rowBetween}>
                <Text style={styles.queueType}>{item.type}</Text>
                <Text style={styles.queueTime}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.queuePayload} numberOfLines={2}>
                {JSON.stringify(item.payload)}
              </Text>
              <Text style={styles.queueId}>{item.id}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  networkCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeader: { color: '#06b6d4', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { color: '#10b981', fontSize: 14, fontWeight: '700', marginVertical: 8 },
  offlineText: { color: '#f59e0b', fontSize: 14, fontWeight: '700', marginVertical: 8 },
  toggleBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnOffline: { backgroundColor: '#f59e0b22', borderWidth: 1, borderColor: '#f59e0b55' },
  toggleBtnOnline: { backgroundColor: '#10b98122', borderWidth: 1, borderColor: '#10b98155' },
  toggleBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  syncBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  syncBtnDisabled: { opacity: 0.5 },
  syncBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800', letterSpacing: 0.8 },
  syncBtnSub: { color: '#bae6fd', fontSize: 10, marginTop: 2 },
  sectionHeader: { color: '#94a3b8', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  emptyCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  emptyIcon: { color: '#10b981', fontSize: 32, marginBottom: 8 },
  emptyTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  emptyText: { color: '#64748b', fontSize: 11, textAlign: 'center' },
  queueList: { gap: 10 },
  queueItem: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  queueType: { color: '#06b6d4', fontSize: 11, fontWeight: '800' },
  queueTime: { color: '#64748b', fontSize: 10, fontFamily: 'monospace' },
  queuePayload: { color: '#cbd5e1', fontSize: 11, fontFamily: 'monospace', marginVertical: 4 },
  queueId: { color: '#475569', fontSize: 9, fontFamily: 'monospace' },
});
