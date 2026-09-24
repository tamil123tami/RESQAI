import { useState } from 'react';
import { Bell, MapPin, AlertTriangle, Phone, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { emergencyContacts, precautions } from '../data/mockData';

function Alerts() {
  const { alerts: allAlerts, getFilteredAlerts, updateAlertStatus, alertFilter, setAlertFilter } = useApp();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const alerts = getFilteredAlerts();

  const handleResolve = (alertId) => {
    updateAlertStatus(alertId, 'resolved');
  };

  const handleReopen = (alertId) => {
    updateAlertStatus(alertId, 'active');
  };

  const stats = {
    all: allAlerts.length,
    active: allAlerts.filter(a => a.status === 'active').length,
    resolved: allAlerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="h-7 w-7 text-blue-400" />
            Alerts & Communication
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {stats.active} active alerts • {stats.resolved} resolved
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setAlertFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              alertFilter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All ({stats.all})
          </button>
          <button
            onClick={() => setAlertFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              alertFilter === 'active'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setAlertFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              alertFilter === 'resolved'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Resolved ({stats.resolved})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {alerts.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Bell className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2">No Alerts</h3>
              <p className="text-sm text-slate-500">
                {alertFilter === 'active'
                  ? 'No active alerts at the moment.'
                  : alertFilter === 'resolved'
                  ? 'No resolved alerts yet.'
                  : 'No alerts in the system. Create a disaster in Demo Controls to generate alerts.'}
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isActive = alert.status === 'active';
              const priorityConfig = {
                P1: { color: 'red', icon: AlertTriangle, border: 'border-l-red-500', bg: 'bg-red-500/5' },
                P2: { color: 'orange', icon: AlertTriangle, border: 'border-l-orange-500', bg: 'bg-orange-500/5' },
                P3: { color: 'yellow', icon: Info, border: 'border-l-yellow-500', bg: 'bg-yellow-500/5' },
                P4: { color: 'blue', icon: Info, border: 'border-l-blue-500', bg: 'bg-blue-500/5' },
              }[alert.priority] || { color: 'gray', icon: Info, border: 'border-l-gray-500', bg: 'bg-gray-500/5' };

              const Icon = priorityConfig.icon;

              return (
                <div
                  key={alert.id}
                  className={`glass-card p-6 border-l-4 ${priorityConfig.border} ${priorityConfig.bg} ${
                    isActive ? '' : 'opacity-60'
                  } cursor-pointer hover:shadow-lg transition-all`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-${priorityConfig.color}-500/10`}>
                        <Icon className={`h-5 w-5 text-${priorityConfig.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-white">
                          {alert.type.toUpperCase()} - {alert.area}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.area}</span>
                          <span>•</span>
                          <span>
                            {new Date(alert.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          alert.priority === 'P1'
                            ? 'bg-red-500/20 text-red-400'
                            : alert.priority === 'P2'
                            ? 'bg-orange-500/20 text-orange-400'
                            : alert.priority === 'P3'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {alert.priority}
                      </span>
                      {!isActive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-4">{alert.message}</p>

                  {/* Risk Level */}
                  <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-slate-800/40">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              alert.riskPercent >= 75
                                ? 'bg-red-500'
                                : alert.riskPercent >= 50
                                ? 'bg-orange-500'
                                : alert.riskPercent >= 25
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${alert.riskPercent}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-white">{alert.riskPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(alert.id);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReopen(alert.id);
                        }}
                        className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Reopen Alert
                        </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlert(alert);
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emergency Contacts */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-400" />
              Emergency Contacts
            </h3>
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div key={contact.number} className="p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{contact.label}</span>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                  >
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Precautions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Safety Precautions
            </h3>
            <div className="space-y-2">
              {precautions.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="glass-card max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Alert Details</h3>
                <p className="text-sm text-slate-400">{selectedAlert.area}</p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400 hover:text-red-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Type</p>
                <p className="text-base font-semibold text-white capitalize">{selectedAlert.type}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Priority</p>
                <p className="text-base font-semibold text-white">{selectedAlert.priority}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Message</p>
                <p className="text-sm text-slate-300">{selectedAlert.message}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Risk Level</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        selectedAlert.riskPercent >= 75
                          ? 'bg-red-500'
                          : selectedAlert.riskPercent >= 50
                          ? 'bg-orange-500'
                          : selectedAlert.riskPercent >= 25
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${selectedAlert.riskPercent}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold text-white">{selectedAlert.riskPercent}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Location</p>
                <p className="text-sm text-slate-300">
                  {selectedAlert.lat?.toFixed(3)}, {selectedAlert.lng?.toFixed(3)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Time</p>
                <p className="text-sm text-slate-300">
                  {new Date(selectedAlert.timestamp).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedAlert.status === 'active'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {selectedAlert.status === 'active' ? (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Resolved
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedAlert.status === 'active' ? (
                <button
                  onClick={() => {
                    handleResolve(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Mark Resolved
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleReopen(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="h-5 w-5" />
                  Reopen Alert
                </button>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alerts;
