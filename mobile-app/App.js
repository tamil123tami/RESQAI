import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import FieldDashboardScreen from './src/screens/FieldDashboardScreen';
import TriageMatrixScreen from './src/screens/TriageMatrixScreen';
import VoiceCommanderScreen from './src/screens/VoiceCommanderScreen';
import OfflineSyncScreen from './src/screens/OfflineSyncScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'triage' | 'voice' | 'sync'
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      {/* Top App Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>ResQ AI</Text>
            <View style={styles.fieldUnitBadge}>
              <Text style={styles.fieldUnitText}>FIELD UNIT</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>SDRF 4th Bn · Ops Sector 4B</Text>
        </View>

        <TouchableOpacity onPress={toggleConnection} style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#f59e0b' }]} />
          <Text style={[styles.statusPillText, { color: isConnected ? '#10b981' : '#f59e0b' }]}>
            {isConnected ? '5G LIVE' : 'BLACKOUT'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Screen Body */}
      <View style={styles.body}>
        {activeTab === 'dashboard' && (
          <FieldDashboardScreen
            isConnected={isConnected}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'triage' && <TriageMatrixScreen />}
        {activeTab === 'voice' && <VoiceCommanderScreen />}
        {activeTab === 'sync' && (
          <OfflineSyncScreen
            isConnected={isConnected}
            onToggleConnection={toggleConnection}
          />
        )}
      </View>

      {/* Bottom Tactical Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>📍</Text>
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>
            Mission
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'triage' && styles.tabItemActive]}
          onPress={() => setActiveTab('triage')}
        >
          <Text style={styles.tabIcon}>🏥</Text>
          <Text style={[styles.tabLabel, activeTab === 'triage' && styles.tabLabelActive]}>
            Triage
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'voice' && styles.tabItemActive]}
          onPress={() => setActiveTab('voice')}
        >
          <Text style={styles.tabIcon}>🎙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'voice' && styles.tabLabelActive]}>
            Voice AI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sync' && styles.tabItemActive]}
          onPress={() => setActiveTab('sync')}
        >
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === 'sync' && styles.tabLabelActive]}>
            Sync
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090d16' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { color: '#06b6d4', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  fieldUnitBadge: {
    backgroundColor: '#0891b222',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0891b255',
  },
  fieldUnitText: { color: '#22d3ee', fontSize: 9, fontWeight: '800' },
  headerSub: { color: '#64748b', fontSize: 11, marginTop: 1 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: 10 },
  tabItemActive: { backgroundColor: '#1e293b' },
  tabIcon: { fontSize: 18, marginBottom: 2 },
  tabLabel: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  tabLabelActive: { color: '#06b6d4', fontWeight: '800' },
});
