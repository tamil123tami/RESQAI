import { useState } from 'react';
import {
  Building2,
  Truck,
  Heart,
  MapPin,
  Ambulance,
  X,
  Phone,
  Navigation,
  Clock,
  Compass,
  Crosshair,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

function Hospitals() {
  const {
    hospitals,
    dispatchAmbulance,
    distanceOrigin,
    detectUserLocation,
    isDetectingLocation,
    disasters,
  } = useApp();

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const activeOrigin = distanceOrigin;
  const hasActiveDisaster = disasters.some((d) => d.status !== 'completed');

  // Filter hospitals based on search input
  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.type && h.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalHospitals = hospitals.length;
  const totalAmbulances = hospitals.reduce((sum, h) => sum + (h.ambulances || 0), 0);
  const emergencyReady = hospitals.filter((h) => h.emergency).length;
  const closestHospital = hospitals[0] || null;

  const handleDetailsClick = (hospital) => {
    setSelectedHospital(hospital);
  };

  const handleCallAmbulance = (hospital) => {
    if (hospital.ambulances <= 0) {
      return;
    }
    dispatchAmbulance(hospital.id, `Sector near ${activeOrigin.name}`);
    if (selectedHospital && selectedHospital.id === hospital.id) {
      setSelectedHospital((prev) => ({
        ...prev,
        ambulances: Math.max(0, prev.ambulances - 1),
      }));
    }
  };

  const handleGetDirections = (hospital) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${activeOrigin.lat},${activeOrigin.lng}&destination=${hospital.lat},${hospital.lng}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Origin Location Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-blue-400" />
            Medical Centers & Trauma Facilities
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-Time Proximity Routing, Emergency Transit Times & Ambulance Dispatch
          </p>
        </div>

        {/* Origin GPS indicator & Detect Location button */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  activeOrigin.isDisaster
                    ? 'animate-ping bg-red-400 opacity-75'
                    : 'animate-ping bg-emerald-400 opacity-75'
                }`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  activeOrigin.isDisaster ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                {activeOrigin.isDisaster ? 'Distance From Disaster:' : 'Proximity Measured From:'}
              </p>
              <p className={`text-xs font-bold truncate max-w-[260px] ${activeOrigin.isDisaster ? 'text-red-300' : 'text-white'}`}>
                {activeOrigin.label}
              </p>
            </div>
          </div>

          <button
            onClick={() => detectUserLocation()}
            disabled={isDetectingLocation}
            className="ml-2 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className={`h-3.5 w-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Detecting...' : 'Update GPS'}</span>
          </button>
        </div>
      </div>

      {/* Stats Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-blue-500/10 rounded-xl p-3">
            <Building2 className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalHospitals}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Tracked Hospitals</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-emerald-500/10 rounded-xl p-3">
            <Compass className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">
              {closestHospital ? `${closestHospital.distance} km` : '0 km'}
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              Closest: {closestHospital ? closestHospital.name.split(' ')[0] : 'None'}
            </p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-purple-500/10 rounded-xl p-3">
            <Truck className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalAmbulances}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Fleet Ambulances</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-red-500/10 rounded-xl p-3">
            <Heart className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{emergencyReady}</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">24x7 Trauma Centers</p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card p-4 flex items-center gap-3">
        <Search className="h-5 w-5 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter hospitals by facility name or category..."
          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full pl-2"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-white">
            Clear
          </button>
        )}
      </div>

      {/* Hospitals Table - Clean Distance and Action Layout */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="text-left p-4">Facility Name</th>
                <th className="text-center p-4">Category</th>
                <th className="text-center p-4">{hasActiveDisaster ? 'Distance from Disaster' : 'Distance from You'}</th>
                <th className="text-center p-4">Ambulance ETA</th>
                <th className="text-center p-4">Ambulances</th>
                <th className="text-center p-4">Emergency Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHospitals.map((hospital, idx) => (
                <tr
                  key={hospital.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-800/10' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
                        <Building2 className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          {hospital.name}
                          {idx === 0 && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                              CLOSEST
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>
                            {hospital.lat?.toFixed(3)}, {hospital.lng?.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {hospital.type}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Compass className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-extrabold text-emerald-400">
                        {hospital.distance} km
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-300 font-medium text-xs">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      <span>{hospital.transitEta || '15 mins'}</span>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Ambulance className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-bold text-white">
                        {hospital.ambulances}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 uppercase">
                        {hospital.emergency ? '24/7 Trauma' : 'Operational'}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCallAmbulance(hospital)}
                        disabled={hospital.ambulances <= 0}
                        title="Dispatch Ambulance"
                        className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all shadow hover:shadow-red-600/20"
                      >
                        🚑 Dispatch
                      </button>
                      <button
                        onClick={() => handleGetDirections(hospital)}
                        title="Open Route in Google Maps"
                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shadow hover:shadow-blue-600/20"
                      >
                        <Navigation className="h-3 w-3" /> Route
                      </button>
                      <button
                        onClick={() => handleDetailsClick(hospital)}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-all"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedHospital(null)}
        >
          <div
            className="glass-card max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedHospital.name}</h3>
                  <p className="text-xs text-slate-400">{selectedHospital.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
              >
                <X className="h-6 w-6 text-slate-400 hover:text-red-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Distance & Transit Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 border-l-4 border-l-emerald-500 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs uppercase font-semibold">
                    <Compass className="h-4 w-4 text-emerald-400" />
                    {hasActiveDisaster ? 'Distance from Disaster' : 'Distance from Base'}
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-400">
                    {selectedHospital.distance} km
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {hasActiveDisaster ? `From: ${activeOrigin.label}` : 'Calculated straight-line radius'}
                  </p>
                </div>

                <div className="glass-card p-4 border-l-4 border-l-blue-500 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs uppercase font-semibold">
                    <Clock className="h-4 w-4 text-blue-400" />
                    Transit Time
                  </div>
                  <p className="text-3xl font-extrabold text-blue-400">
                    {selectedHospital.transitEta || '15 mins'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Estimated ambulance speed</p>
                </div>
              </div>

              {/* Ambulance Fleet Status */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400">
                    <Ambulance className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ambulance Fleet Readiness</h4>
                    <p className="text-xs text-slate-400">Equipped with Oxygen, Defibrillators & Paramedics</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">{selectedHospital.ambulances}</span>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase">Units Ready</p>
                </div>
              </div>

              {/* 24/7 Critical Care info */}
              {selectedHospital.emergency && (
                <div className="glass-card p-4 border-l-4 border-l-red-500 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-5 w-5 text-red-400" />
                    <span className="text-sm font-bold text-red-400">24/7 Level-1 Emergency & Trauma Care</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Equipped with round-the-clock emergency surgeons, advanced life support ambulances, and immediate triage.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleCallAmbulance(selectedHospital)}
                  disabled={selectedHospital.ambulances <= 0}
                  className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Ambulance className="h-5 w-5" />
                  Dispatch Ambulance
                </button>
                <button
                  onClick={() => handleGetDirections(selectedHospital)}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Navigation className="h-5 w-5" />
                  Google Maps Route
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hospitals;
