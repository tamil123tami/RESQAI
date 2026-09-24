import { useState } from 'react';
import {
  Shield,
  FileText,
  Printer,
  CheckCircle2,
  Building2,
  Award,
  Download,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { GEM_TENDER_TEMPLATE } from '../../data/commercialData';

export default function GovernmentTenderPortal() {
  const [targetState, setTargetState] = useState('Tamil Nadu');
  const [procuringBody, setProcuringBody] = useState('Tamil Nadu State Disaster Management Authority (TNSDMA)');
  const [bidAmountCr, setBidAmountCr] = useState(2.2);
  const [tenderRef, setTenderRef] = useState(GEM_TENDER_TEMPLATE.tenderId);
  const [showTenderDossier, setShowTenderDossier] = useState(false);

  const complianceItems = [
    { spec: 'ITU-T Common Alerting Protocol (CAP v1.2) Multi-Channel Broadcast', status: '100% Compliant', ref: 'NDMA Alerting Mandate' },
    { spec: 'Multi-Agency Reservoir Outflow Telemetry (CWC / WRD Gauges)', status: '100% Compliant', ref: 'Dam Safety Act 2021' },
    { spec: 'Hyperlocal Precipitation Doppler Radar Tile Ingestion (RainViewer/IMD)', status: '100% Compliant', ref: 'WMO Severe Weather Standard' },
    { spec: 'Autonomous Field Responder Dispatch & Dynamic Ambulance Routing', status: '100% Compliant', ref: 'Sub-8 Minute Response SLA' },
    { spec: 'Startup India GFR 2017 Rule 173(i) Prior Turnover Exemption', status: '100% Eligible', ref: 'DPIIT DIPP89210 Recognized' },
    { spec: 'State Disaster Response Fund (SDRF) Audit Certificate Generation', status: '100% Compliant', ref: '15th Finance Commission Rules' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="h-4 w-4 text-blue-400" /> B2G Government Procurement Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              GeM (Government e-Marketplace) & SDRF Tender Generator
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Accelerate public sector procurement cycles from 18 months down to 4 weeks. Generate compliant technical bid proposals leveraging DPIIT Startup India exemptions under GFR 2017 Rule 173(i).
            </p>
          </div>

          <button
            onClick={() => setShowTenderDossier(true)}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 shrink-0"
          >
            <Printer className="h-4 w-4" /> Generate Official GeM Bid Dossier
          </button>
        </div>
      </div>

      {/* Tender Configuration & Compliance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Procurement Configuration */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-700 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-400" /> Tender Bid Parameters
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target State Government:</label>
            <select
              value={targetState}
              onChange={(e) => {
                setTargetState(e.target.value);
                setProcuringBody(
                  e.target.value === 'Tamil Nadu'
                    ? 'Tamil Nadu State Disaster Management Authority (TNSDMA)'
                    : e.target.value === 'Karnataka'
                    ? 'Karnataka State Disaster Management Authority (KSDMA)'
                    : 'Andhra Pradesh State Disaster Management Authority (APSDMA)'
                );
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Tamil Nadu">Tamil Nadu (TNSDMA & Chennai EOC)</option>
              <option value="Karnataka">Karnataka (KSDMA & BBMP EOC)</option>
              <option value="Andhra Pradesh">Andhra Pradesh (APSDMA & Visakhapatnam)</option>
              <option value="Odisha">Odisha (OSDMA & Cyclone Management)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Procuring Department:</label>
            <input
              type="text"
              value={procuringBody}
              onChange={(e) => setProcuringBody(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">GeM Bid / RFP Reference ID:</label>
            <input
              type="text"
              value={tenderRef}
              onChange={(e) => setTenderRef(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Annual Commercial SaaS Quote:</span>
              <span className="font-bold text-blue-400 font-mono">₹{bidAmountCr} Crores / year</span>
            </div>
            <input
              type="range"
              min="1.2"
              max="4.5"
              step="0.1"
              value={bidAmountCr}
              onChange={(e) => setBidAmountCr(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹1.2 Cr (District Tier)</span>
              <span>₹2.2 Cr (Standard State)</span>
              <span>₹4.5 Cr (Mega State)</span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs space-y-1.5 text-slate-300">
            <span className="font-bold text-blue-300 flex items-center gap-1.5">
              <Award className="h-4 w-4" /> GFR 2017 Rule 173(i) Competitive Edge:
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              As a DPIIT recognized startup, RESQAI is exempt from prior turnover (e.g. ₹10 Cr minimum) and prior experience requirements for public disaster management procurement tenders.
            </p>
          </div>
        </div>

        {/* Right: Technical Specification Compliance Matrix */}
        <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Technical Specification Compliance Matrix
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              100% Mandate Matched
            </span>
          </div>

          <div className="space-y-2.5">
            {complianceItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{item.spec}</div>
                  <div className="text-[11px] text-slate-400">Standard: {item.ref}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0 text-[11px]">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-slate-400">Guaranteed System Uptime</span>
              <div className="text-lg font-black text-white mt-0.5 font-mono">99.99%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-slate-400">Field Mobilization Speed</span>
              <div className="text-lg font-black text-cyan-400 mt-0.5 font-mono">&lt; 8 Minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tender Dossier Modal */}
      {showTenderDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Government e-Marketplace (GeM) Bid Proposal Dossier
                  </h3>
                  <p className="text-xs text-slate-400">
                    Technical & Commercial RFP Submission Packet for {targetState} EOC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTenderDossier(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4">
              <div className="border-b border-slate-800 pb-3 text-center">
                <div className="font-bold text-white text-sm">
                  GOVERNMENT OF {targetState.toUpperCase()} · DISASTER MANAGEMENT AUTHORITY
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  BID SUBMISSION REF: {tenderRef}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">VENDOR:</span>
                  <span className="text-white font-bold">RESQAI Technologies Pvt Ltd (DPIIT Recognized)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PROCURING ENTITY:</span>
                  <span className="text-white">{procuringBody}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PROCUREMENT VEHICLE:</span>
                  <span className="text-cyan-400">GeM Custom Bid / Direct Purchase under Rule 149</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">COMMERCIAL BID PRICE:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ₹{bidAmountCr} Crores / Annum (Inclusive of Taxes)
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="text-slate-400 font-bold mb-2">TECHNICAL CONFORMANCE DECLARATION:</div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  RESQAI fully complies with NDMA guidelines, ITU-T CAP v1.2 citizen emergency broadcast protocols, CWC reservoir real-time hydro-telemetry, and Open-Meteo multi-district severe weather alerts. Exemption claimed under Rule 173(i) of GFR 2017 for Micro & Small Enterprises / Startups.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between text-[11px]">
                <span className="text-slate-400">AUTHORIZED SIGNATORY:</span>
                <span className="text-white font-bold">Chief Executive Officer, RESQAI</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Export Official Bid PDF
              </button>
              <button
                onClick={() => setShowTenderDossier(false)}
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
