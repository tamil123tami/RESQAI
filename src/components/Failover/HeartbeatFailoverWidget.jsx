import { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  RotateCcw,
  Zap,
  Radio,
  Layers,
  X,
} from 'lucide-react';
import { heartbeatService } from '../../services/heartbeatFailoverService';

export default function HeartbeatFailoverWidget({ isModalOpen, onClose }) {
  const [state, setState] = useState(heartbeatService.getState());

  useEffect(() => {
    const unsubscribe = heartbeatService.subscribe((updated) => {
      setState(updated);
    });
    return unsubscribe;
  }, []);

  const { primaryNode, standbyNode, raftState, isPrimaryKilled, isFailoverActive, logs } = state;

  return (
    <div>
      {/* If used inside a modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    EOC Controller Heartbeat & Failover Center
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                      Raft Term #{raftState.currentTerm}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Roadmap Item #1: High-availability dual-controller failover with automatic leader election under 3s.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alert Banner if Failover is Active */}
            {isFailoverActive && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm">EMERGENCY FAILOVER IN EFFECT</h4>
                    <p className="text-xs text-amber-200/80">
                      Primary Node failed heartbeat check. Standby Node in Bengaluru has assumed full leadership of the EOC.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => heartbeatService.recoverPrimaryNode()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Recover Primary
                </button>
              </div>
            )}

            {/* Controller Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Node Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  primaryNode.status === 'ONLINE'
                    ? 'bg-slate-950/80 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : 'bg-red-950/20 border-red-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      {primaryNode.id}
                    </span>
                    <h4 className="text-base font-bold text-white">{primaryNode.name}</h4>
                    <p className="text-xs text-slate-400">{primaryNode.datacenter}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      primaryNode.status === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    }`}
                  >
                    {primaryNode.status}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Raft Role:</span>
                    <span className="font-mono font-bold text-white">{primaryNode.role}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Heartbeat Latency:</span>
                    <span className="font-mono text-cyan-300">{primaryNode.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Missed Heartbeats:</span>
                    <span
                      className={`font-mono font-bold ${
                        primaryNode.missedPings > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {primaryNode.missedPings} / 3 threshold
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Internal IP:</span>
                    <span className="font-mono text-slate-400">{primaryNode.ip}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Activity className="h-4 w-4 text-cyan-400 animate-spin" />
                    <span>Pulse Interval: 1.5s</span>
                  </div>

                  {!isPrimaryKilled ? (
                    <button
                      onClick={() => heartbeatService.simulatePrimaryCrash()}
                      className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs transition-colors"
                    >
                      Simulate Node Crash
                    </button>
                  ) : (
                    <button
                      onClick={() => heartbeatService.recoverPrimaryNode()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                    >
                      Restore Node
                    </button>
                  )}
                </div>
              </div>

              {/* Standby DR Node Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  standbyNode.role === 'PROMOTED_LEADER'
                    ? 'bg-slate-950/80 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      {standbyNode.id}
                    </span>
                    <h4 className="text-base font-bold text-white">{standbyNode.name}</h4>
                    <p className="text-xs text-slate-400">{standbyNode.datacenter}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      standbyNode.role === 'PROMOTED_LEADER'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}
                  >
                    {standbyNode.status}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Raft Role:</span>
                    <span className="font-mono font-bold text-amber-400">{standbyNode.role}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Data Replication Lag:</span>
                    <span className="font-mono text-emerald-400">{standbyNode.syncReplicationLagMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Quorum Health:</span>
                    <span className="font-mono text-white">2 / 3 Quorum Acquired</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Internal IP:</span>
                    <span className="font-mono text-slate-400">{standbyNode.ip}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Synchronous Mirroring</span>
                  </div>

                  {standbyNode.role !== 'PROMOTED_LEADER' ? (
                    <button
                      onClick={() => heartbeatService.triggerAutomaticFailover()}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
                    >
                      Force Failover Drill
                    </button>
                  ) : (
                    <span className="text-xs text-amber-300 font-bold">Active Master EOC</span>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-cyan-400" /> Cluster Audit & Consensus Log
              </h4>
              <div className="h-36 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px] whitespace-nowrap">{log.timestamp}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                        log.level === 'CRITICAL' || log.level === 'ERROR'
                          ? 'bg-red-950 text-red-400'
                          : log.level === 'WARN'
                          ? 'bg-amber-950 text-amber-400'
                          : log.level === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-slate-300 text-[11px]">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
