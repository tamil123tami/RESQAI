/**
 * Offline-First Persistence Service for React Native Field Responder App
 * Provides on-device local queueing with AsyncStorage, optimistic updates,
 * and automatic synchronization with central State EOC.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@resq_offline_action_queue';
const TRIAGE_KEY = '@resq_triage_counts';
const MISSION_KEY = '@resq_active_mission';

export const OfflineStorageService = {
  /**
   * Get all queued actions pending network sync
   */
  async getQueue() {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading offline queue:', e);
      return [];
    }
  },

  /**
   * Queue an emergency action for sync
   */
  async enqueueAction(type, payload) {
    try {
      const queue = await this.getQueue();
      const item = {
        id: `MOBILE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type,
        payload,
        timestamp: new Date().toISOString(),
        synced: false,
      };
      queue.unshift(item);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      return item;
    } catch (e) {
      console.error('Error enqueuing action:', e);
      return null;
    }
  },

  /**
   * Remove item from queue after successful sync
   */
  async dequeueAction(itemId) {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      console.error('Error dequeuing action:', e);
      return [];
    }
  },

  /**
   * Clear all synced queue items
   */
  async clearQueue() {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
      return true;
    } catch (e) {
      console.error('Error clearing queue:', e);
      return false;
    }
  },

  /**
   * Save on-device Triage Matrix counts
   */
  async saveTriageCounts(counts) {
    try {
      await AsyncStorage.setItem(TRIAGE_KEY, JSON.stringify(counts));
    } catch (e) {
      console.warn('Error saving triage counts:', e);
    }
  },

  /**
   * Load on-device Triage Matrix counts
   */
  async loadTriageCounts() {
    try {
      const data = await AsyncStorage.getItem(TRIAGE_KEY);
      return data ? JSON.parse(data) : { red: 0, yellow: 0, green: 0, black: 0 };
    } catch (e) {
      return { red: 0, yellow: 0, green: 0, black: 0 };
    }
  },

  /**
   * Cache current active mission details
   */
  async saveActiveMission(mission) {
    try {
      await AsyncStorage.setItem(MISSION_KEY, JSON.stringify(mission));
    } catch (e) {
      console.warn('Error saving mission:', e);
    }
  },

  async loadActiveMission() {
    try {
      const data = await AsyncStorage.getItem(MISSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
};
