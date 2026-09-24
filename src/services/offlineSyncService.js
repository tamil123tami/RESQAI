/**
 * Offline Mode & Low-Connectivity Sync Service
 * Implements Roadmap Item #3: Offline mode for low-connectivity disaster zones
 *
 * Provides offline operation caching, IndexedDB/localStorage queuing for field units,
 * simulated comms blackout toggles, and automatic conflict-free batch sync upon network restoration.
 */

const STORAGE_KEY = 'resqai_offline_action_queue';

class OfflineSyncService {
  constructor() {
    this.isSimulatedOffline = false;
    this.isBrowserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.queue = this.loadQueue();
    this.subscribers = new Set();
    this.syncInProgress = false;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleBrowserOnlineChange(true));
      window.addEventListener('offline', () => this.handleBrowserOnlineChange(false));
    }
  }

  loadQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to persist offline queue:', e);
    }
  }

  get isOnline() {
    return this.isBrowserOnline && !this.isSimulatedOffline;
  }

  setSimulatedOffline(status) {
    this.isSimulatedOffline = status;
    this.notifySubscribers();

    if (this.isOnline && this.queue.length > 0) {
      this.syncQueuedActions();
    }
  }

  handleBrowserOnlineChange(isOnline) {
    this.isBrowserOnline = isOnline;
    this.notifySubscribers();

    if (this.isOnline && this.queue.length > 0) {
      this.syncQueuedActions();
    }
  }

  /**
   * Queue an action when offline or low connectivity
   */
  queueAction(type, payload, metadata = {}) {
    const item = {
      id: 'OFFLINE-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      type,
      payload,
      metadata: {
        ...metadata,
        queuedAt: new Date().toISOString(),
        deviceGps: metadata.gps || { lat: 13.0827, lng: 80.2707 },
      },
      status: 'QUEUED_LOCAL',
    };

    this.queue.unshift(item);
    this.saveQueue();
    this.notifySubscribers();

    // If currently online, immediately trigger auto-sync
    if (this.isOnline) {
      this.syncQueuedActions();
    }

    return item;
  }

  /**
   * Replay and flush queued actions to the central EOC state
   */
  async syncQueuedActions() {
    if (this.syncInProgress || this.queue.length === 0 || !this.isOnline) return;

    this.syncInProgress = true;
    this.notifySubscribers();

    try {
      // Small simulated latency for transmission of offline packet
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const syncedItems = [...this.queue];
      this.queue = [];
      this.saveQueue();

      // Dispatch custom sync event so AppContext or components can merge
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('resqai_offline_sync_complete', {
            detail: { count: syncedItems.length, items: syncedItems },
          })
        );
      }
    } finally {
      this.syncInProgress = false;
      this.notifySubscribers();
    }
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
    this.notifySubscribers();
  }

  getState() {
    return {
      isOnline: this.isOnline,
      isBrowserOnline: this.isBrowserOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      queueCount: this.queue.length,
      queue: [...this.queue],
      syncInProgress: this.syncInProgress,
    };
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const state = this.getState();
    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.error('Offline subscriber error:', e);
      }
    });
  }
}

export const offlineSyncService = new OfflineSyncService();
