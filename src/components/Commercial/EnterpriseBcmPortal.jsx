import { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  Shield,
  Activity,
  DollarSign,
  TrendingDown,
  Navigation,
  FileCheck2,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Printer,
} from 'lucide-react';
import { ENTERPRISE_FACILITIES } from '../../data/commercialData';

export default function EnterpriseBcmPortal() {
  const [facilities, setFacilities] = useState(ENTERPRISE_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState(ENTERPRISE_FACILITIES[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBcpModal, setShowBcpModal] = useState(false);

  // New facility form state
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDistrict, setNewDistrict] = useState('Chennai');
  const [newAssetValuation, setNewAssetValuation] = useState(1500);
  const [newDowntimeCost, setNewDowntimeCost] = useState(3.5);

  const handleAddFacility = (e) => {
    e.preventDefault();
    if (!newFacilityName) return;

    const newObj = {
      id: `fac-${Date.now()}`,
      name: newFacilityName,
      location: newLocation || 'Tamil Nadu Industrial Corridor',
      district: newDistrict,
      coordinates: { lat: 13.04, lng: 80.21 },
      elevationMeters: 14.5,
      assetValuationCr: Number(newAssetValuation),
      dailyDowntimeCostCr: Number(newDowntimeCost),
      primaryRisks: ['Urban Inundation', 'Logistics Bottleneck', 'Power Surge'],
      criticalThresholds: { windGust: 90, rain24h: 120, surge: 1.0 },
      contactPerson: 'Corporate Operations Manager',
    };

    setFacilities([...facilities, newObj]);
    setSelectedFacility(newObj);
    setShowAddModal(false);
    setNewFacilityName('');
    setNewLocation('');
  };

  // Calculate dynamic BCM metrics for selected facility
  const exposureRiskScore = Math.min(
    95,
    Math.round((100 - selectedFacility.elevationMeters * 2) * 0.9)
  );

  const potentialLossCr = Math.round(
    selectedFacility.assetValuationCr * 0.12 + selectedFacility.dailyDowntimeCostCr * 4
  );

  const lossAvertedWithResQCr = Math.round(potentialLossCr * 0.72);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="h-4 w-4 text-purple-400" /> B2B Enterprise Business Continuity (BCM)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Critical Infrastructure & Industrial Asset Safeguard
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Automate multi-crore disaster protection for ports, automotive manufacturing hubs, and IT data centers. Receive micro-zone telemetry alerts 18 hours prior to inundation to protect inventory and reroute supply chains.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30"
            >
              <Plus className="h-4 w-4" /> Monitor New Facility
            </button>
            <button
              onClick={() => setShowBcpModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <FileCheck2 className="h-4 w-4 text-cyan-400" /> Export Enterprise BCP
            </button>
          </div>
        </div>
      </div>

      {/* Facilities Grid & Deep Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monitored Facilities Selector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Enrolled Corporate Facilities ({facilities.length})
            </h3>
            <span className="text-xs text-purple-400 font-semibold">Annual ACV: ₹25L/hub</span>
          </div>

          <div className="space-y-3">
            {facilities.map((fac) => {
              const isSelected = selectedFacility.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500/60 ring-1 ring-purple-400 shadow-lg'
                      : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{fac.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{fac.location}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300 shrink-0">
                      ₹{fac.assetValuationCr} Cr
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Daily Downtime Cost:</span>
                    <span className="font-bold text-rose-400 font-mono">
                      ₹{fac.dailyDowntimeCostCr} Cr / day
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Facility Operational Risk & Early Warning Plan */}
        <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-700">
            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Telemetry Profile
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">{selectedFacility.name}</h3>
              <p className="text-xs text-slate-400">{selectedFacility.location} · Ground Elevation: {selectedFacility.elevationMeters}m MSL</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Vulnerability Rating</span>
              <div className={`text-2xl font-black ${exposureRiskScore > 70 ? 'text-rose-400' : 'text-amber-400'}`}>
                {exposureRiskScore}/100
              </div>
            </div>
          </div>

          {/* Critical Threshold Alarms */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Automated Operations Alert Thresholds
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400">Wind Gust Shutdown</span>
                <div className="text-base font-bold text-amber-400 mt-1">
                  &gt; {selectedFacility.criticalThresholds.windGust} km/h
                </div>
                <span className="text-[10px] text-slate-500">Crane & Yard Lock</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400">Rainfall Ingress</span>
                <div className="text-base font-bold text-cyan-400 mt-1">
                  &gt; {selectedFacility.criticalThresholds.rain24h} mm/24h
                </div>
                <span className="text-[10px] text-slate-500">Basement Sump Pumps</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400">Storm Surge Height</span>
                <div className="text-base font-bold text-rose-400 mt-1">
                  {selectedFacility.criticalThresholds.surge > 0 ? `> ${selectedFacility.criticalThresholds.surge} m` : 'N/A (Inland)'}
                </div>
                <span className="text-[10px] text-slate-500">Seawall Barrier Trigger</span>
              </div>
            </div>
          </div>

          {/* Financial Exposure & Loss Averted */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 to-slate-900 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-300 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> Business Interruption (BI) Financial Exposure
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                ROI: 14.8x
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-xs text-slate-400">Estimated Unmitigated Loss:</span>
                <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                  ₹{potentialLossCr} Crores
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Asset damage + 4 days downtime</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Loss Mitigated with ResQ AI:</span>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                  ₹{lossAvertedWithResQCr} Crores
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Inventory elevated + early rerouting</p>
              </div>
            </div>
          </div>

          {/* Action Protocols */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Autonomous Supply Chain Contingency Protocols
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Logistics Rerouting:</strong> Automatically triggers diversion of inbound container fleets to Bangalore / Sri City bypass when highway inundation exceeds 0.4m.
                </span>
              </li>
              <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sub-Station Isolation:</strong> Dispatches pre-emptive cutover to rooftop battery banks and diesel storage 4 hours prior to Kaveri/Adyar river flood peak.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" /> Enroll Enterprise Asset
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFacility} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Facility / Campus Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foxconn Sriperumbudur Assembly Plant"
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Location Address:</label>
                <input
                  type="text"
                  placeholder="e.g. SIPCOT Phase 2, Kancheepuram"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Asset Valuation (₹ Cr):</label>
                  <input
                    type="number"
                    value={newAssetValuation}
                    onChange={(e) => setNewAssetValuation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Daily Downtime (₹ Cr):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDowntimeCost}
                    onChange={(e) => setNewDowntimeCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
                >
                  Save & Calibrate Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export BCP Modal */}
      {showBcpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Enterprise Business Continuity Plan (BCP)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Disaster Mitigation & Uptime Strategy Dossier for Board of Directors
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBcpModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">TARGET ASSET:</span>
                <span className="text-white font-bold">{selectedFacility.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">ASSET VALUATION:</span>
                <span className="text-white">₹{selectedFacility.assetValuationCr} Crores</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">PROJECTED AVERTED LOSS:</span>
                <span className="text-emerald-400 font-bold">₹{lossAvertedWithResQCr} Crores per severe event</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">EARLY WARNING SLA:</span>
                <span className="text-cyan-400 font-bold">18 Hours pre-inundation notification</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AUDIT HASH:</span>
                <span className="text-slate-400 text-[10px]">BCP-ENTERPRISE-2026-0924-RESQAI-VERIFIED</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Export BCP PDF
              </button>
              <button
                onClick={() => setShowBcpModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
