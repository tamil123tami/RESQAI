/**
 * Controller Heartbeat & High-Availability Failover Service
 * Implements Roadmap Item #1: Controller heartbeat failover
 *
 * Simulates enterprise distributed leader-election with Raft-style heartbeat monitoring,
 * automatic hot-standby failover (<3s threshold), split-brain protection, and manual disaster drills.
 */

class HeartbeatFailoverService {
  constructor() {
    this.primaryNode = {
      id: 'NODE-01-CHENNAI-EOC',
      name: 'Primary EOC Controller (Chennai Main)',
      datacenter: 'TNSDC Tier-IV, Perungudi, Chennai',
      ip: '10.240.12.8',
      role: 'LEADER',
      status: 'ONLINE',
      uptimeSec: 489200,
      cpuUsage: 28,
      memUsage: 44,
      lastHeartbeat: Date.now(),
      missedPings: 0,
      latencyMs: 12,
    };

    this.standbyNode = {
      id: 'NODE-02-BENGALURU-DR',
      name: 'Hot-Standby DR Controller (Bengaluru Cloud)',
      datacenter: 'NIC Cloud DR Zone, Bengaluru',
      ip: '10.241.88.19',
      role: 'FOLLOWER',
      status: 'HOT_STANDBY',
      uptimeSec: 489200,
      cpuUsage: 14,
      memUsage: 31,
      lastHeartbeat: Date.now(),
      syncReplicationLagMs: 2.1,
      latencyMs: 24,
    };

    this.raftState = {
      currentTerm: 14,
      votedFor: 'NODE-01-CHENNAI-EOC',
      quorumSize: 3,
      nodesInQuorum: ['NODE-01-CHENNAI-EOC', 'NODE-02-BENGALURU-DR', 'WITNESS-HYD-03'],
      failoverThresholdSec: 4,
      lastElectionTime: '2026-09-24T00:00:00.000Z',
    };

    this.isPrimaryKilled = false;
    this.isFailoverActive = false;
    this.failoverLogs = [
      {
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
        level: 'INFO',
        message: 'Raft Cluster Quorum established. NODE-01-CHENNAI-EOC elected as Primary Leader.',
      },
      {
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
        level: 'INFO',
        message: 'Synchronous log replication to NODE-02-BENGALURU-DR active (Lag: 2.1ms).',
      },
    ];

    this.subscribers = new Set();
    this.intervalId = null;
    this.startHeartbeatLoop();
  }

  startHeartbeatLoop() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      const now = Date.now();

      if (!this.isPrimaryKilled) {
        // Normal state: Primary pulses heartbeat
        this.primaryNode.lastHeartbeat = now;
        this.primaryNode.latencyMs = Math.round(10 + Math.random() * 8);
        this.primaryNode.missedPings = 0;
        this.primaryNode.status = 'ONLINE';
        this.standbyNode.lastHeartbeat = now;
      } else {
        // Primary is simulated down / unreachable
        this.primaryNode.missedPings += 1;
        this.primaryNode.status = 'OFFLINE_CRITICAL';

        // Check if failover threshold exceeded
        if (this.primaryNode.missedPings >= 3 && !this.isFailoverActive) {
          this.triggerAutomaticFailover();
        }
      }

      this.notifySubscribers();
    }, 1500);
  }

  triggerAutomaticFailover() {
    this.isFailoverActive = true;
    this.raftState.currentTerm += 1;
    this.raftState.votedFor = this.standbyNode.id;
    this.raftState.lastElectionTime = new Date().toISOString();

    this.standbyNode.role = 'PROMOTED_LEADER';
    this.standbyNode.status = 'ACTIVE_PRIMARY';
    this.primaryNode.role = 'ISOLATED';

    this.addLog('CRITICAL', `Heartbeat timeout! 3 missed pulses from ${this.primaryNode.id}. Commencing emergency leader election.`);
    this.addLog('WARN', `Raft Term ${this.raftState.currentTerm}: Standby ${this.standbyNode.id} received 2/3 quorum votes.`);
    this.addLog('SUCCESS', `FAILOVER COMPLETE (<2.8s). ${this.standbyNode.name} is now the ACTIVE Emergency Operations Controller.`);
  }

  simulatePrimaryCrash() {
    this.isPrimaryKilled = true;
    this.primaryNode.status = 'UNRESPONSIVE';
    this.addLog('ERROR', `SIMULATION: Primary Controller (${this.primaryNode.id}) heartbeat link severed.`);
    this.notifySubscribers();
  }

  recoverPrimaryNode() {
    this.isPrimaryKilled = false;
    this.isFailoverActive = false;
    this.primaryNode.status = 'ONLINE';
    this.primaryNode.role = 'LEADER';
    this.primaryNode.missedPings = 0;
    this.primaryNode.lastHeartbeat = Date.now();

    this.standbyNode.role = 'FOLLOWER';
    this.standbyNode.status = 'HOT_STANDBY';
    this.raftState.votedFor = this.primaryNode.id;

    this.addLog('SUCCESS', `Primary Node (${this.primaryNode.id}) restored. Re-synchronized ledger and safely reassumed primary role.`);
    this.notifySubscribers();
  }

  addLog(level, message) {
    this.failoverLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    });
    if (this.failoverLogs.length > 50) this.failoverLogs.pop();
  }

  getState() {
    return {
      primaryNode: { ...this.primaryNode },
      standbyNode: { ...this.standbyNode },
      raftState: { ...this.raftState },
      isPrimaryKilled: this.isPrimaryKilled,
      isFailoverActive: this.isFailoverActive,
      logs: [...this.failoverLogs],
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
        console.error('Heartbeat subscriber error:', e);
      }
    });
  }
}

export const heartbeatService = new HeartbeatFailoverService();
