import { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Users, FileText, AlertCircle, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

function MissionStatus() {
  const { teams, completedMissions, completeMission, showNotification } = useApp();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [completionReport, setCompletionReport] = useState('');

  // Get only deployed teams
  const deployedTeams = teams.filter(t => t.status === 'deployed');

  const handleMarkComplete = (team) => {
    console.log('✅ Marking mission complete for:', team.name);
    setSelectedTeam(team);
  };

  const handleSubmitCompletion = () => {
    if (!selectedTeam) return;

    if (!completionReport.trim()) {
      alert('Please provide a mission completion report');
      return;
    }

    console.log(`✅ Mission completed: ${selectedTeam.name}`);
    console.log(`📝 Report: ${completionReport}`);

    completeMission(selectedTeam.id, completionReport.trim());

    // Reset form
    setCompletionReport('');
    setSelectedTeam(null);
  };

  const getMissionDuration = (deployedAt) => {
    if (!deployedAt) return 'N/A';
    const duration = Date.now() - new Date(deployedAt).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Award className="h-7 w-7 text-green-400" />
          Mission Status & Completion
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Track active missions and mark as complete to return resources
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-orange-500/10 rounded-xl p-3">
            <Clock className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{deployedTeams.length}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Active Missions</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-green-500/10 rounded-xl p-3">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{completedMissions.length}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Completed Missions</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-blue-500/10 rounded-xl p-3">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {deployedTeams.reduce((sum, t) => sum + t.members, 0)}
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Personnel Deployed</p>
          </div>
        </div>
      </div>

      {/* Active Missions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-400" />
          Active Missions ({deployedTeams.length})
        </h3>

        {deployedTeams.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No active missions</p>
            <p className="text-slate-600 text-xs mt-1">All teams on standby</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {deployedTeams.map(team => (
              <div
                key={team.id}
                className="p-4 rounded-xl bg-slate-800/40 border-l-4 border-l-orange-500 hover:bg-slate-800/60 transition-all"
              >
                {/* Team Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-bold mb-2">
                      {team.id}
                    </span>
                    <h4 className="text-base font-bold text-white">{team.name}</h4>
                    <p className="text-xs text-slate-400">{team.leader}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                    </span>
                    <span className="text-xs font-bold text-orange-400">IN PROGRESS</span>
                  </div>
                </div>

                {/* Mission Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span className="text-slate-300">{team.location || team.assignedArea}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300">{team.mission || 'Emergency response'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-400" />
                    <span className="text-slate-300">{team.members} personnel</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span className="text-slate-300">
                      Duration: {getMissionDuration(team.deployedAt)}
                    </span>
                  </div>
                </div>

                {/* Deployed Time */}
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 mb-4">
                  <p className="text-xs text-slate-500">
                    Deployed: {new Date(team.deployedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleMarkComplete(team)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Mission Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {selectedTeam && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="glass-card max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Complete Mission</h3>
                  <p className="text-sm text-slate-400">{selectedTeam.name} - {selectedTeam.location}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Mission Summary */}
              <div className="glass-card p-4 border-l-4 border-l-orange-500 bg-orange-500/5">
                <h4 className="text-sm font-bold text-orange-400 mb-3">Mission Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Team</p>
                    <p className="text-white font-semibold">{selectedTeam.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Location</p>
                    <p className="text-white font-semibold">{selectedTeam.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Personnel</p>
                    <p className="text-white font-semibold">{selectedTeam.members} members</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="text-white font-semibold">{getMissionDuration(selectedTeam.deployedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Resource Return Notice */}
              <div className="glass-card p-4 border-l-4 border-l-green-500 bg-green-500/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-green-400 mb-1">Resources Will Be Returned</h4>
                    <p className="text-xs text-slate-400">
                      Upon completion, <span className="text-white font-semibold">{selectedTeam.members} personnel</span> and <span className="text-white font-semibold">1 team</span> will be returned to available resources.
                      The team will be marked as "Standby" and available for new deployments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Completion Report */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Mission Completion Report *
                </label>
                <textarea
                  value={completionReport}
                  onChange={(e) => setCompletionReport(e.target.value)}
                  placeholder="Provide a brief summary of the mission outcome, actions taken, people rescued, areas covered, etc..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="5"
                />
                <p className="text-xs text-slate-500 mt-1">
                  This report will be logged for records and documentation
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitCompletion}
                  disabled={!completionReport.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Confirm & Return Team
                </button>
                <button
                  onClick={() => {
                    setSelectedTeam(null);
                    setCompletionReport('');
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="glass-card p-5 border-l-4 border-l-blue-500 bg-blue-500/5">
        <h4 className="text-sm font-bold text-blue-400 mb-2">💡 How Mission Completion Works</h4>
        <ul className="text-xs text-slate-400 space-y-1.5">
          <li>• Teams mark their missions as complete when objectives are achieved</li>
          <li>• A completion report is required for documentation</li>
          <li>• Upon completion, the team is automatically recalled to base</li>
          <li>• All personnel and resources are returned to the available pool</li>
          <li>• Resource tracker updates instantly showing increased availability</li>
          <li>• Team becomes "Standby" and ready for new deployments</li>
        </ul>
      </div>
    </div>
  );
}

export default MissionStatus;
