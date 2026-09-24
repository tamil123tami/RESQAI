import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { OfflineStorageService } from '../services/OfflineStorageService';
import { VoiceOpsService } from '../services/VoiceOpsService';

export default function TriageMatrixScreen() {
  const [counts, setCounts] = useState({ red: 2, yellow: 5, green: 11, black: 0 });

  useEffect(() => {
    (async () => {
      const saved = await OfflineStorageService.loadTriageCounts();
      if (saved) setCounts(saved);
    })();
  }, []);

  const updateCount = async (category, delta) => {
    const updated = {
      ...counts,
      [category]: Math.max(0, counts[category] + delta),
    };
    setCounts(updated);
    await OfflineStorageService.saveTriageCounts(updated);
    await VoiceOpsService.triggerHaptic('medium');

    await OfflineStorageService.enqueueAction('TRIAGE_UPDATE', {
      unitId: 'Echo-Unit-04',
      category,
      newTotal: updated[category],
      delta,
      timestamp: new Date().toISOString(),
    });
  };

  const handleClear = () => {
    Alert.alert(
      'Reset Triage Matrix',
      'Are you sure you want to reset all counts to zero?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const zero = { red: 0, yellow: 0, green: 0, black: 0 };
            setCounts(zero);
            await OfflineStorageService.saveTriageCounts(zero);
          },
        },
      ]
    );
  };

  const totalVictims = counts.red + counts.yellow + counts.green + counts.black;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>START Protocol Triage Matrix</Text>
        <Text style={styles.subtitle}>
          Simple Triage and Rapid Treatment · Live Casualty Classification
        </Text>
      </View>

      {/* Summary Total */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL CASUALTIES ASSESSED</Text>
        <Text style={styles.summaryTotal}>{totalVictims}</Text>
        <Text style={styles.summarySub}>
          Synchronized with State Trauma Registry & Bed Availability
        </Text>
      </View>

      {/* Triage Cards */}
      {/* RED: Immediate */}
      <View style={[styles.triageCard, { borderColor: '#ef4444' }]}>
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.colorBadge, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.triageType}>RED · IMMEDIATE</Text>
          </View>
          <Text style={styles.triageDesc}>
            Life-threatening trauma or airway compromise. Requires immediate ALS transport.
          </Text>
        </View>

        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => updateCount('red', -1)}
          >
            <Text style={styles.stepBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{counts.red}</Text>
          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: '#dc2626' }]}
            onPress={() => updateCount('red', 1)}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* YELLOW: Delayed */}
      <View style={[styles.triageCard, { borderColor: '#f59e0b' }]}>
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.colorBadge, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.triageType}>YELLOW · DELAYED</Text>
          </View>
          <Text style={styles.triageDesc}>
            Serious injuries but can tolerate delayed transport up to 1-2 hours without threat to life.
          </Text>
        </View>

        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => updateCount('yellow', -1)}
          >
            <Text style={styles.stepBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{counts.yellow}</Text>
          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: '#d97706' }]}
            onPress={() => updateCount('yellow', 1)}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GREEN: Minor */}
      <View style={[styles.triageCard, { borderColor: '#10b981' }]}>
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.colorBadge, { backgroundColor: '#10b981' }]} />
            <Text style={styles.triageType}>GREEN · MINOR</Text>
          </View>
          <Text style={styles.triageDesc}>
            "Walking wounded." Superficial lacerations, mild contusions. Direct to field station.
          </Text>
        </View>

        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => updateCount('green', -1)}
          >
            <Text style={styles.stepBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{counts.green}</Text>
          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: '#059669' }]}
            onPress={() => updateCount('green', 1)}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BLACK: Expectant */}
      <View style={[styles.triageCard, { borderColor: '#64748b' }]}>
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.colorBadge, { backgroundColor: '#475569' }]} />
            <Text style={styles.triageType}>BLACK · EXPECTANT</Text>
          </View>
          <Text style={styles.triageDesc}>
            Deceased or catastrophic injuries where survival is unlikely with current field resources.
          </Text>
        </View>

        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => updateCount('black', -1)}
          >
            <Text style={styles.stepBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{counts.black}</Text>
          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: '#475569' }]}
            onPress={() => updateCount('black', 1)}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={handleClear}>
        <Text style={styles.resetBtnText}>Reset Matrix For New Sector</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  summaryCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  summaryLabel: { color: '#06b6d4', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  summaryTotal: { color: '#ffffff', fontSize: 42, fontWeight: '900', marginVertical: 4 },
  summarySub: { color: '#64748b', fontSize: 11, textAlign: 'center' },
  triageCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: { flex: 1, paddingRight: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  colorBadge: { width: 10, height: 10, borderRadius: 5 },
  triageType: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  triageDesc: { color: '#94a3b8', fontSize: 10, lineHeight: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    backgroundColor: '#1f2937',
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  countText: { color: '#ffffff', fontSize: 20, fontWeight: '900', minWidth: 26, textAlign: 'center' },
  resetBtn: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  resetBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
});
