import { useApp } from '../context/AppContext';
import { Users, User, Ambulance, Building2, TrendingDown, TrendingUp, ShieldCheck } from 'lucide-react';

function ResourceTracker() {
  const { getResourceStats, hospitals } = useApp();
  const resources = getResourceStats();

  const getPercentage = (used, total) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getStatusColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' };
    if (percentage > 25) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' };
    return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Tactical Resource Allocation</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="text-xs text-green-400 font-medium">Real-time</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Teams */}
        <div className="stat-card p-4 rounded-xl bg-slate-800/40 border-l-4 border-l-blue-500 glow-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl icon-glow-blue">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Rescue Units</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{resources.teams.available}</span>
                <span className="text-sm text-slate-400">/ {resources.teams.total} Ready</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Standby Rate</span>
              <span className="text-slate-400">{getPercentage(resources.teams.available, resources.teams.total)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getStatusColor(resources.teams.available, resources.teams.total).bg}`}
                style={{ width: `${getPercentage(resources.teams.available, resources.teams.total)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Personnel */}
        <div className="stat-card p-4 rounded-xl bg-slate-800/40 border-l-4 border-l-purple-500 glow-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl icon-glow-purple">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Field Specialists</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{resources.personnel.available}</span>
                <span className="text-sm text-slate-400">/ {resources.personnel.total}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Available</span>
              <span className="text-slate-400">{getPercentage(resources.personnel.available, resources.personnel.total)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getStatusColor(resources.personnel.available, resources.personnel.total).bg}`}
                style={{ width: `${getPercentage(resources.personnel.available, resources.personnel.total)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ambulances */}
        <div className="stat-card p-4 rounded-xl bg-slate-800/40 border-l-4 border-l-red-500 glow-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl icon-glow-red">
              <Ambulance className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Ambulance Fleet</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{resources.ambulances.total}</span>
                <span className="text-sm text-emerald-400 font-semibold">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Fleet Status</span>
              <span className="text-emerald-400 font-medium">100% Operational</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div className="h-2 rounded-full bg-red-500" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Emergency Facilities */}
        <div className="stat-card p-4 rounded-xl bg-slate-800/40 border-l-4 border-l-emerald-500 glow-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl icon-glow-green">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Trauma Centers</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{resources.facilities.emergencyReady}</span>
                <span className="text-sm text-slate-400">/ {resources.facilities.total} Centers</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">24/7 Readiness</span>
              <span className="text-emerald-400 font-bold">{getPercentage(resources.facilities.emergencyReady, resources.facilities.total)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${getPercentage(resources.facilities.emergencyReady, resources.facilities.total)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Resource Alerts */}
      <div className="mt-6 space-y-2">
        {resources.teams.available === 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 hover-lift">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-sm text-red-400 font-semibold">⚠️ All response squads currently committed in field operations</span>
          </div>
        )}
        {resources.teams.available <= 1 && resources.teams.available > 0 && (
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3 hover-lift">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-sm text-yellow-400 font-semibold">⚠️ Low reserve margin - Only {resources.teams.available} squad on standby</span>
          </div>
        )}
        {resources.teams.available >= 2 && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 hover-lift">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm text-green-400 font-semibold">✓ Regional response capacity at optimal readiness</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceTracker;
