import { useState } from 'react';
import { Shield, Brain, Activity, Database, CheckCircle2, Clock, TrendingUp, Settings, Eye, ChevronRight, BarChart3, RefreshCw, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';


// AI Workflow Steps
const workflowSteps = [
  {
    step: 1,
    name: 'Data Collection',
    status: 'active',
    description: 'Real-time sensor & satellite data ingestion',
  },
  {
    step: 2,
    name: 'Data Processing',
    status: 'active',
    description: 'Cleaning and normalizing incoming data',
  },
  {
    step: 3,
    name: 'Hazard Detection',
    status: 'active',
    description: 'AI models analyzing hazard patterns',
  },
  {
    step: 4,
    name: 'Risk Assessment',
    status: 'active',
    description: 'Calculating risk levels for each area',
  },
  {
    step: 5,
    name: 'Change Detection',
    status: 'active',
    description: 'Detecting significant data changes',
  },
  {
    step: 6,
    name: 'Alert Generation',
    status: 'active',
    description: 'Creating priority-based alerts',
  },
  {
    step: 7,
    name: 'Resource Optimization',
    status: 'active',
    description: 'Recommending team deployments',
  },
  {
    step: 8,
    name: 'Controller Review',
    status: 'waiting',
    description: 'Awaiting human approval',
  },
];

// Data Sources
const dataSources = [
  { name: 'IMD Weather API', status: 'active', uptime: 99.8, latency: 45 },
  { name: 'Seismology Network', status: 'active', uptime: 99.2, latency: 67 },
  { name: 'Satellite Imagery', status: 'active', uptime: 98.5, latency: 120 },
  { name: 'River Gauge Sensors', status: 'active', uptime: 97.8, latency: 32 },
  { name: 'Weather Radar', status: 'active', uptime: 99.9, latency: 28 },
  { name: 'Disaster Authority DB', status: 'warning', uptime: 95.2, latency: 180 },
];

// AI Model Performance
const modelPerformance = [
  { model: 'Flood Risk Predictor', accuracy: 94.2, precision: 92.8, recall: 91.5, f1Score: 92.1 },
  { model: 'Cyclone Detector', accuracy: 89.7, precision: 88.3, recall: 87.9, f1Score: 88.1 },
  { model: 'Earthquake Analyzer', accuracy: 91.5, precision: 90.2, recall: 89.8, f1Score: 90.0 },
  { model: 'Change Detection AI', accuracy: 93.8, precision: 92.1, recall: 91.3, f1Score: 91.7 },
];

function AdminDashboard() {
  const { aiDecisions, updateAiDecision, reanalyzeAiDecision, aiFilter, setAiFilter, teams, tasks, disasters, dispatchedAmbulances } = useApp();
  const [selectedLog, setSelectedLog] = useState(null);

  const filteredLogs = aiDecisions.filter(log => {
    if (aiFilter === 'all') return true;
    if (aiFilter === 'analyzing') return log.status === 'analyzing';
    return log.status === aiFilter;
  });

  const handleApprove = (decisionId) => {
    updateAiDecision(decisionId, 'approved', 'Approved by controller');
    setSelectedLog(null);
  };

  const handleReject = (decisionId) => {
    const reason = prompt('Reason for rejection (optional):') || 'Rejected by controller';
    updateAiDecision(decisionId, 'rejected', reason);
    setSelectedLog(null);
  };

  const handleReanalyze = (decisionId) => {
    reanalyzeAiDecision(decisionId);
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
    if (status === 'pending') return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    if (status === 'rejected') return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
    if (status === 'analyzing') return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
    return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
  };

  const analyzingCount = aiDecisions.filter(l => l.status === 'analyzing').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="h-7 w-7 text-purple-400" />
          AI Agent Workflow & Admin Dashboard
        </h2>
        <p className="text-sm text-slate-400 mt-1">Real AI-powered decisions via Groq/Gemini LLM — review, approve, or reject</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-purple-500/10 rounded-xl p-3">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{aiDecisions.length}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">AI Decisions</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-green-500/10 rounded-xl p-3">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{aiDecisions.filter(l => l.status === 'approved').length}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Approved</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-yellow-500/10 rounded-xl p-3">
            <Clock className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{aiDecisions.filter(l => l.status === 'pending').length}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Pending Review</p>
          </div>
        </div>

        {analyzingCount > 0 && (
          <div className="glass-card p-5 flex items-center gap-4 border border-purple-500/30">
            <div className="bg-purple-500/10 rounded-xl p-3">
              <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{analyzingCount}</p>
              <p className="text-xs text-purple-400 font-medium uppercase tracking-wide">AI Analyzing</p>
            </div>
          </div>
        )}

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-blue-500/10 rounded-xl p-3">
            <BarChart3 className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {aiDecisions.filter(d => d.confidence > 0).length > 0
                ? Math.round(aiDecisions.filter(d => d.confidence > 0).reduce((sum, d) => sum + d.confidence, 0) / aiDecisions.filter(d => d.confidence > 0).length)
                : 0}%
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Avg Confidence</p>
          </div>
        </div>
      </div>

      {/* AI Workflow Visualization */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AI Workflow Pipeline (Real-time)</h3>
          <div className="flex items-center gap-2">
            {analyzingCount > 0 ? (
              <>
                <Loader2 className="h-3 w-3 text-purple-400 animate-spin" />
                <span className="text-[10px] text-purple-400 font-medium">AI ENGINE PROCESSING ({analyzingCount})</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-[10px] text-green-400 font-medium">ALL SYSTEMS OPERATIONAL</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {workflowSteps.map((step, idx) => {
            const isAnalyzing = step.step >= 3 && step.step <= 7 && analyzingCount > 0;
            return (
              <div key={step.step} className="relative">
                <div className={`p-4 rounded-xl border-2 transition-all ${isAnalyzing ? 'border-purple-500/50 bg-purple-500/5' : step.status === 'active' ? 'border-blue-500/50 bg-blue-500/5' : step.status === 'waiting' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-slate-700/50 bg-slate-800/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isAnalyzing ? 'bg-purple-500/20 text-purple-400' : step.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      Step {step.step}
                    </span>
                    {isAnalyzing && <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />}
                    {!isAnalyzing && step.status === 'active' && <Activity className="h-4 w-4 text-blue-400 animate-pulse" />}
                    {!isAnalyzing && step.status === 'waiting' && <Clock className="h-4 w-4 text-yellow-400" />}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{step.name}</h4>
                  <p className="text-xs text-slate-400">{isAnalyzing ? 'LLM processing...' : step.description}</p>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Decision Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                AI Decision Log (LLM-Powered)
              </h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setAiFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${aiFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                >
                  All ({aiDecisions.length})
                </button>
                <button
                  onClick={() => setAiFilter('approved')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${aiFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                >
                  Approved ({aiDecisions.filter(l => l.status === 'approved').length})
                </button>
                <button
                  onClick={() => setAiFilter('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${aiFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                >
                  Pending ({aiDecisions.filter(l => l.status === 'pending').length})
                </button>
                <button
                  onClick={() => setAiFilter('rejected')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${aiFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                >
                  Rejected ({aiDecisions.filter(l => l.status === 'rejected').length})
                </button>
                {analyzingCount > 0 && (
                  <button
                    onClick={() => setAiFilter('analyzing')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${aiFilter === 'analyzing' ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                  >
                    Analyzing ({analyzingCount})
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredLogs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No AI decisions yet. Add a disaster to trigger AI analysis.</p>
                </div>
              )}
              {filteredLogs.map(log => {
                const statusColors = getStatusColor(log.status);
                const isAnalyzing = log.status === 'analyzing';
                return (
                  <div key={log.id} onClick={() => setSelectedLog(log)} className={`p-4 rounded-xl border cursor-pointer hover:shadow-lg transition-all ${statusColors.bg} ${statusColors.border} ${selectedLog?.id === log.id ? 'ring-2 ring-blue-500' : ''} ${isAnalyzing ? 'animate-pulse' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 text-purple-400" />
                          )}
                          <span className="text-xs font-bold text-slate-400">{log.module || log.algorithm || 'AI Decision Engine'}</span>
                          {log.reanalyzed && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">RE-ANALYZED</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{log.decision}</h4>
                        <p className="text-xs text-slate-400">Area: {log.area}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors.bg} ${statusColors.text} mb-1`}>
                          {isAnalyzing ? '⏳ Analyzing...' : log.status}
                        </span>
                        <p className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {!isAnalyzing && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/50">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-slate-400">Confidence: <span className="font-bold text-green-400">{log.confidence}%</span></span>
                        </div>
                        {log.dataPoints > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Database className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-slate-400">{log.dataPoints} data points</span>
                          </div>
                        )}
                        {log.alertLevel && (
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className={`h-3 w-3 ${log.alertLevel === 'P1' ? 'text-red-400' : log.alertLevel === 'P2' ? 'text-orange-400' : 'text-yellow-400'}`} />
                            <span className={`text-xs font-bold ${log.alertLevel === 'P1' ? 'text-red-400' : log.alertLevel === 'P2' ? 'text-orange-400' : 'text-yellow-400'}`}>{log.alertLevel}</span>
                          </div>
                        )}
                        {log.evacuationNeeded && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">EVACUATION</span>
                        )}
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="mt-3 pt-3 border-t border-purple-500/20">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                          </div>
                          <span className="text-[10px] text-purple-400 font-medium">LLM Processing</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Selected Decision Details */}
          {selectedLog && (
            <div className="glass-card p-5 animate-slide-up">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Decision Details
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Algorithm / Engine</p>
                  <p className="text-xs text-white font-medium">{selectedLog.algorithm || 'ResQAI LLM Decision Engine v2.0'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Reasoning</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedLog.reasoning}</p>
                </div>

                {selectedLog.priorityActions && selectedLog.priorityActions.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Priority Actions</p>
                    <ul className="space-y-1">
                      {selectedLog.priorityActions.map((action, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-blue-400 font-bold mt-0.5">{i + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedLog.estimatedResponseTime && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Est. Response Time</p>
                    <p className="text-xs text-orange-400 font-semibold">{selectedLog.estimatedResponseTime}</p>
                  </div>
                )}

                {selectedLog.riskTrend && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Trend</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedLog.riskTrend === 'increasing' ? 'bg-red-500/20 text-red-400' : selectedLog.riskTrend === 'decreasing' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {selectedLog.riskTrend === 'increasing' ? '↑ Increasing' : selectedLog.riskTrend === 'decreasing' ? '↓ Decreasing' : '→ Stable'}
                    </span>
                  </div>
                )}

                {(selectedLog.previousRisk !== undefined && selectedLog.newRisk !== undefined && selectedLog.newRisk > 0) && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Change</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">{selectedLog.previousRisk}%</span>
                      <ChevronRight className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-bold text-red-400">{selectedLog.newRisk}%</span>
                      <span className="text-xs text-red-400">(+{selectedLog.newRisk - selectedLog.previousRisk}%)</span>
                    </div>
                  </div>
                )}

                {selectedLog.affectedPopulation > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Est. Affected Population</p>
                    <p className="text-xs text-white font-semibold">{selectedLog.affectedPopulation.toLocaleString()}</p>
                  </div>
                )}

                {selectedLog.recommendedTeams > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Recommended Teams</p>
                    <p className="text-xs text-blue-400 font-semibold">{selectedLog.recommendedTeams} team{selectedLog.recommendedTeams > 1 ? 's' : ''}</p>
                  </div>
                )}

                {selectedLog.aiAnalyzedAt && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Analyzed At</p>
                    <p className="text-[10px] text-slate-400">{new Date(selectedLog.aiAnalyzedAt).toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  {selectedLog.status === 'approved' ? (
                    <div className="text-xs space-y-3">
                      <div>
                        <p className="text-green-400 font-semibold mb-1">✓ Approved by {selectedLog.approvedBy || selectedLog.comment}</p>
                        {selectedLog.approvedAt && <p className="text-slate-500">{new Date(selectedLog.approvedAt).toLocaleString()}</p>}
                      </div>

                      {/* Post-Approval Pipeline Summary */}
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                        <p className="text-[10px] text-green-400 uppercase tracking-wider font-bold mb-2">Post-Approval Actions Executed</p>
                        <ul className="space-y-1.5">
                          {(() => {
                            const deployedToArea = teams.filter(t => t.status === 'deployed' && t.assignedArea === selectedLog.area);
                            return deployedToArea.length > 0 ? (
                              <li className="flex items-center gap-1.5 text-slate-300">
                                <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                                <span>{deployedToArea.length} team{deployedToArea.length > 1 ? 's' : ''} deployed: {deployedToArea.map(t => t.name).join(', ')}</span>
                              </li>
                            ) : (
                              <li className="flex items-center gap-1.5 text-slate-500">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>No standby teams were available</span>
                              </li>
                            );
                          })()}
                          {(() => {
                            const matchedDisaster = disasters.find(d => d.areaName === selectedLog.area);
                            const relatedAmb = dispatchedAmbulances.filter(a => a.disasterId && matchedDisaster && String(a.disasterId) === String(matchedDisaster.id) && a.status === 'dispatched');
                            return relatedAmb.length > 0 ? (
                              <li className="flex items-center gap-1.5 text-slate-300">
                                <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                                <span>Ambulance dispatched from {relatedAmb[0].hospitalName}</span>
                              </li>
                            ) : (
                              <li className="flex items-center gap-1.5 text-slate-300">
                                <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" />
                                <span>Ambulance dispatch attempted</span>
                              </li>
                            );
                          })()}
                          {(() => {
                            const relatedTasks = tasks.filter(t => t.aiGenerated && t.decisionId === selectedLog.id);
                            return relatedTasks.length > 0 ? (
                              <li className="flex items-center gap-1.5 text-slate-300">
                                <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                                <span>{relatedTasks.length} field task{relatedTasks.length > 1 ? 's' : ''} created</span>
                              </li>
                            ) : null;
                          })()}
                          <li className="flex items-center gap-1.5 text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                            <span>Push alerts sent to commanders</span>
                          </li>
                          {selectedLog.evacuationNeeded && (
                            <li className="flex items-center gap-1.5 text-red-400 font-semibold">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              <span>EVACUATION alert triggered</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : selectedLog.status === 'rejected' ? (
                    <div className="text-xs">
                      <p className="text-red-400 font-semibold mb-1">✗ Rejected</p>
                      {selectedLog.reviewedAt && <p className="text-slate-500">{new Date(selectedLog.reviewedAt).toLocaleString()}</p>}
                      {selectedLog.comment && (
                        <p className="text-slate-400 mt-2 text-[11px]">Reason: {selectedLog.comment}</p>
                      )}
                    </div>
                  ) : selectedLog.status === 'analyzing' ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                      <span className="text-xs text-purple-400 font-semibold">AI Engine is analyzing...</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-yellow-400 font-semibold text-xs mb-3">⏳ Awaiting Human Review</p>
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => handleApprove(selectedLog.id)}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(selectedLog.id)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                        >
                          ✗ Reject
                        </button>
                      </div>
                      <button
                        onClick={() => handleReanalyze(selectedLog.id)}
                        className="w-full px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Re-analyze with AI
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Data Sources Status */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Sources
            </h3>
            <div className="space-y-2">
              {dataSources.map((source, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-800/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white font-medium">{source.name}</span>
                    <span className={`text-[10px] font-bold ${source.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {source.status === 'active' ? '● ACTIVE' : '● WARNING'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Uptime: {source.uptime}%</span>
                    <span>Latency: {source.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Model Performance */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Model Performance
            </h3>
            <div className="space-y-3">
              {modelPerformance.map((model, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/40">
                  <p className="text-xs text-white font-semibold mb-2">{model.model}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-500">Accuracy:</span>
                      <span className="text-green-400 font-bold ml-1">{model.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Precision:</span>
                      <span className="text-blue-400 font-bold ml-1">{model.precision}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Recall:</span>
                      <span className="text-purple-400 font-bold ml-1">{model.recall}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500">F1-Score:</span>
                      <span className="text-orange-400 font-bold ml-1">{model.f1Score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
