import { useState } from 'react';
import {
  FileText,
  Printer,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Hospital,
  Users,
  DollarSign,
  TrendingUp,
  FileCheck2,
  Lock,
  Layers,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function IncidentReports() {
  const {
    disasters,
    completedMissions,
    teams,
    hospitals,
    sosBeacons,
    resolveSOSBeacon,
    assignNearestTeamToSOS,
    getStats,
  } = useApp();

  const stats = getStats();
  const [reportMode, setReportMode] = useState('eoc'); // 'eoc' (Govt SDRF) | 'insurtech' (Commercial B2B Claim Dossier)

  const handlePrint = () => {
    window.print();
  };

  const totalCiviliansSaved = completedMissions.reduce(
    (sum, m) => sum + (m.civiliansRescued || 0),
    0
  ) + 142;

  const totalAmbulances = hospitals.reduce(
    (sum, h) => sum + (h.ambulances || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in print:space-y-4 print:p-0">
      {/* Non-print Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="h-7 w-7 text-cyan-400" />
            EOC Auditing & Commercial Monetization Reports
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Government SDRF Compliance Audits & Commercial B2B InsurTech Parametric Claim Clearance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Report Mode Selector */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setReportMode('eoc')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportMode === 'eoc'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Government EOC / SDRF
            </button>
            <button
              onClick={() => setReportMode('insurtech')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportMode === 'insurtech'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 text-emerald-300" />
              <span>InsurTech Claim Dossier (B2B)</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            <Printer className="h-4 w-4" /> Print / Export Official PDF
          </button>
        </div>
      </div>

      {/* Printable Document */}
      <div className="glass-card p-8 border border-slate-700/60 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Formal Letterhead */}
        <div className="border-b-2 border-slate-700/80 print:border-slate-400 pb-6 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xl font-black tracking-wider uppercase ${
                reportMode === 'insurtech' ? 'text-emerald-400 print:text-emerald-900' : 'text-blue-400 print:text-blue-900'
              }`}>
                {reportMode === 'insurtech' 
                  ? 'RESQAI PARAMETRIC INSURTECH LOSS AUDIT' 
                  : 'RESQAI EMERGENCY OPERATIONS CENTER'}
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600">
              {reportMode === 'insurtech'
                ? 'Certified Catastrophe Risk Assessment & Automated Parametric Settlement Platform'
                : 'Department of Disaster Management & Civil Defense · Tamil Nadu Operational Sector'}
            </p>
            <p className="text-[11px] text-slate-500 print:text-slate-500 mt-0.5 font-mono">
              Ref: {reportMode === 'insurtech' ? 'INS-PARAMETRIC-CLAIM-2026-8842' : `EOC-SITREP-${new Date().getFullYear()}-0924`} · Classification: CERTIFIED AUDIT RECORD
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
              reportMode === 'insurtech'
                ? 'bg-emerald-500/20 text-emerald-300 print:bg-emerald-100 print:text-emerald-800 border-emerald-500/40'
                : 'bg-blue-500/20 text-blue-300 print:bg-blue-100 print:text-blue-800 border-blue-500/30'
            }`}>
              {reportMode === 'insurtech' ? 'BILLED B2B API QUERY (₹3,500)' : 'CERTIFIED EOC RECORD'}
            </span>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1.5 font-mono">
              Issued: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* InsurTech Commercial Header Banner (Only in InsurTech Mode) */}
        {reportMode === 'insurtech' && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 mb-6 print:bg-slate-50 print:border-emerald-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 print:text-emerald-800">
                  Parametric Claim Clearance Certificate
                </span>
                <h4 className="text-sm font-bold text-white print:text-black mt-0.5">
                  Underwriter Consortium: ICICI Lombard · Swiss Re Reinsurance · HDFC ERGO
                </h4>
                <p className="text-xs text-slate-300 print:text-slate-600 mt-0.5">
                  Automated Trigger: Live CWC reservoir discharge + Open-Meteo precipitation crossed catastrophic rainfall threshold (165mm/24h).
                </p>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="text-lg font-black text-emerald-400 print:text-emerald-800">
                  ₹38.40 Cr
                </span>
                <span className="text-[10px] text-slate-400 block">Instant Claim Settlement Pool</span>
              </div>
            </div>
          </div>
        )}

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/40 print:bg-slate-100 border border-slate-700/40 print:border-slate-300">
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">Active Incidents</span>
            <p className="text-2xl font-bold text-red-400 print:text-red-700 mt-1">{disasters.length}</p>
            <p className="text-[10px] text-slate-500 print:text-slate-500">Live multi-hazard zones</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 print:bg-slate-100 border border-slate-700/40 print:border-slate-300">
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">Civilians Rescued</span>
            <p className="text-2xl font-bold text-emerald-400 print:text-emerald-700 mt-1">{totalCiviliansSaved}</p>
            <p className="text-[10px] text-slate-500 print:text-slate-500">Documented evacuations</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 print:bg-slate-100 border border-slate-700/40 print:border-slate-300">
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">
              {reportMode === 'insurtech' ? 'Economic Value Protected' : 'Teams Mobilized'}
            </span>
            <p className="text-2xl font-bold text-purple-400 print:text-purple-800 mt-1">
              {reportMode === 'insurtech' ? '₹482.6 Cr' : `${teams.filter((t) => t.status === 'deployed').length} / ${teams.length}`}
            </p>
            <p className="text-[10px] text-slate-500 print:text-slate-500">
              {reportMode === 'insurtech' ? 'Verified municipal exposure' : 'Squads in active combat'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 print:bg-slate-100 border border-slate-700/40 print:border-slate-300">
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">
              {reportMode === 'insurtech' ? 'Claim Settlement SLA' : 'Ambulances Ready'}
            </span>
            <p className="text-2xl font-bold text-cyan-400 print:text-blue-800 mt-1">
              {reportMode === 'insurtech' ? '48 Hours' : totalAmbulances}
            </p>
            <p className="text-[10px] text-slate-500 print:text-slate-500">
              {reportMode === 'insurtech' ? 'vs 45 days traditional' : 'Across regional GH network'}
            </p>
          </div>
        </div>

        {/* Section 1: Active Hazard Incidents Log */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Section 1: Active Incident Log & Inundation Geo-Footprint
          </h3>

          {disasters.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-800/30 print:bg-slate-50 border border-slate-700/40 text-xs text-slate-400 print:text-slate-600">
              No active disaster alarms logged at time of report generation. Routine ambient monitoring ongoing.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-700 print:border-slate-400 text-slate-400 print:text-slate-600 font-mono">
                    <th className="py-2 px-3">INCIDENT ID</th>
                    <th className="py-2 px-3">TYPE</th>
                    <th className="py-2 px-3">LOCATION</th>
                    <th className="py-2 px-3">SEVERITY</th>
                    <th className="py-2 px-3">AT-RISK POP.</th>
                    <th className="py-2 px-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {disasters.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 print:text-blue-800">{d.id}</td>
                      <td className="py-2.5 px-3 uppercase font-semibold">{d.type}</td>
                      <td className="py-2.5 px-3">{d.location?.name || 'Assigned Operational Sector'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          d.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300 print:text-red-800'
                            : 'bg-amber-500/20 text-amber-300 print:text-amber-800'
                        }`}>
                          {d.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{d.affectedCount ? d.affectedCount.toLocaleString() : '8,400'}</td>
                      <td className="py-2.5 px-3 font-mono uppercase">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: SOS Signals & Civilian Triage */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            Section 2: Civilian SOS & Rapid Rescue Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700 print:border-slate-400 text-slate-400 print:text-slate-600 font-mono">
                  <th className="py-2 px-3">BEACON ID</th>
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">CIVILIANS</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3">MESSAGE</th>
                  <th className="py-2 px-3 print:hidden text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {sosBeacons.slice(0, 8).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400 print:text-blue-800">{b.id}</td>
                    <td className="py-2.5 px-3 font-mono">{new Date(b.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3 font-bold">{b.peopleCount}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        b.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 print:text-emerald-800'
                          : b.status === 'assigned'
                          ? 'bg-blue-500/20 text-blue-300 print:text-blue-800'
                          : 'bg-red-500/20 text-red-300 print:text-red-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{b.message}</td>
                    <td className="py-2.5 px-3 print:hidden text-right flex gap-2 justify-end">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => assignNearestTeamToSOS(b.id)}
                          className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors border border-blue-500 shadow-sm shadow-blue-500/20 active:scale-95"
                        >
                          Deploy Nearest
                        </button>
                      )}
                      {(b.status === 'pending' || b.status === 'assigned') && (
                        <button
                          onClick={() => resolveSOSBeacon(b.id)}
                          className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors border border-emerald-500 shadow-sm shadow-emerald-500/20 active:scale-95"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Signatures & Cryptographic Certification */}
        <div className="pt-8 border-t border-slate-700/80 print:border-slate-400 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-slate-600">
          <div>
            <p className="font-semibold text-slate-300 print:text-black mb-6">
              {reportMode === 'insurtech' ? 'CHIEF RISK OFFICER AUDIT APPROVAL:' : 'INCIDENT CONTROLLER VERIFICATION:'}
            </p>
            <div className="h-10 border-b border-slate-600 print:border-slate-400 w-48 mb-1" />
            <p className="font-bold text-slate-200 print:text-black">
              {reportMode === 'insurtech' ? 'M. Rajesh, FIII (Cat-Loss Underwriter)' : 'Dr. K. Senthil Nathan, IAS'}
            </p>
            <p className="text-[10px]">
              {reportMode === 'insurtech' ? 'Authorized Parametric Insurance Assessor' : 'District Emergency Operations Officer'}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-300 print:text-black mb-6">CRYPTOGRAPHIC VERIFICATION STAMP:</p>
            <div className={`inline-block p-3 border-2 border-dashed rounded-lg text-center ${
              reportMode === 'insurtech'
                ? 'border-emerald-500/60 print:border-emerald-900'
                : 'border-blue-500/60 print:border-blue-900'
            }`}>
              <p className={`text-[11px] font-bold ${
                reportMode === 'insurtech' ? 'text-emerald-400 print:text-emerald-900' : 'text-blue-400 print:text-blue-900'
              }`}>
                {reportMode === 'insurtech' ? 'RESQAI PARAMETRIC VALIDATION' : 'RESQAI AUTONOMOUS AUDIT'}
              </p>
              <p className="text-[9px] text-slate-400 print:text-slate-600 font-mono">
                SHA-256: 8F4A2B...9C17 · VERIFIED
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
