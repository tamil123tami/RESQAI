import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Percent,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Sparkles,
  Zap,
  TrendingDown,
  Building2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  COMMERCIAL_INSURERS,
  PARAMETRIC_POLICIES,
  generateCertificateHash,
} from '../../data/commercialData';
import { tnDamData } from '../../data/damData';

export default function InsurTechPortal() {
  const [selectedInsurer, setSelectedInsurer] = useState(COMMERCIAL_INSURERS[0].id);
  const [selectedPolicy, setSelectedPolicy] = useState(PARAMETRIC_POLICIES[0].id);
  const [claimDistrict, setClaimDistrict] = useState('Chennai');
  const [policyHolderName, setPolicyHolderName] = useState('Sundaram Logistics Park Pvt Ltd');
  const [policyId, setPolicyId] = useState('POL-IN-2026-8942');
  const [claimAmount, setClaimAmount] = useState(2500000);
  const [isVerifying, setIsVerifying] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Active Policy Metadata
  const currentPolicy = useMemo(() => {
    return PARAMETRIC_POLICIES.find((p) => p.id === selectedPolicy) || PARAMETRIC_POLICIES[0];
  }, [selectedPolicy]);

  const currentInsurer = useMemo(() => {
    return COMMERCIAL_INSURERS.find((ins) => ins.id === selectedInsurer) || COMMERCIAL_INSURERS[0];
  }, [selectedInsurer]);

  // Run Real-Time Telemetry Cross-Validation
  const handleVerifyClaim = () => {
    setIsVerifying(true);
    setClaimResult(null);

    setTimeout(() => {
      // Look up relevant dam/weather conditions for district
      const isDamRelated = currentPolicy.id === 'reservoir-breach';
      const metturDam = tnDamData.find((d) => d.id === 'mettur');
      const damDischarge = metturDam ? metturDam.outflow : 12403;

      // Simulated real-time sensor measurements
      const simulatedRain24h = claimDistrict === 'Chennai' ? 184 : claimDistrict === 'Cuddalore' ? 162 : 118;
      const simulatedWindGust = claimDistrict === 'Nagapattinam' ? 122 : 94;
      const simulatedSurgeMeters = claimDistrict === 'Chennai' ? 2.4 : 1.6;

      let triggered = false;
      let reason = '';

      if (currentPolicy.id === 'urban-flood') {
        triggered = simulatedRain24h >= 150;
        reason = triggered
          ? `Verified: 24h rainfall reached ${simulatedRain24h}mm at district AWS station (Threshold: 150mm).`
          : `Not met: Recorded 24h rainfall was ${simulatedRain24h}mm, below the 150mm policy threshold.`;
      } else if (currentPolicy.id === 'cyclone-wind') {
        triggered = simulatedWindGust >= 115 || simulatedSurgeMeters >= 2.0;
        reason = triggered
          ? `Verified: Coastal surge buoy recorded ${simulatedSurgeMeters}m surge with peak gusts of ${simulatedWindGust} km/h.`
          : `Not met: Wind gust of ${simulatedWindGust} km/h below 115 km/h threshold.`;
      } else if (currentPolicy.id === 'reservoir-breach') {
        triggered = damDischarge > 10000;
        reason = triggered
          ? `Verified: CWC telemetry confirms active reservoir spillway discharge at ${damDischarge.toLocaleString()} cusecs.`
          : `Not met: Dam outflow at ${damDischarge} cusecs was within safe seasonal channel limits.`;
      } else {
        triggered = true;
        reason = 'Verified: Industrial grid sub-station inundation alert sustained > 6 hours.';
      }

      const certHash = generateCertificateHash(
        `${policyId}-${selectedInsurer}-${claimDistrict}-${Date.now()}`
      );

      setClaimResult({
        triggered,
        status: triggered ? 'PARAMETRIC PAYOUT AUTHORIZED' : 'CLAIM THRESHOLD NOT TRIGGERED',
        approvedAmount: triggered ? claimAmount : 0,
        reason,
        simulatedTelemetry: {
          rainfall24h: `${simulatedRain24h} mm`,
          windGust: `${simulatedWindGust} km/h`,
          surge: `${simulatedSurgeMeters} m`,
          damOutflow: `${damDischarge.toLocaleString()} cusecs`,
        },
        turnaroundHours: 36,
        traditionalSurveyLagDays: 45,
        surveyorCostSavedINR: currentPolicy.surveyorCostSaved,
        fraudRiskScore: '1.2% (Extremely Low Risk - Telemetry Verified)',
        certificateHash: certHash,
        verifiedAt: new Date().toISOString(),
      });

      setIsVerifying(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* InsurTech Header Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> B2B InsurTech & Parametric Underwriting
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Autonomous Parametric Insurance Claim Engine
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Eliminate costly manual insurance surveyor delays. RESQAI validates weather, radar, and dam telemetry against policy trigger criteria in milliseconds with cryptographic audit logs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0 text-center">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Settlement SLA</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">&lt; 48 Hours</div>
              <div className="text-[10px] text-slate-500">vs 45-day survey</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Surveyor Fee Cut</div>
              <div className="text-xl font-black text-cyan-400 mt-0.5">-74% Saved</div>
              <div className="text-[10px] text-slate-500">Zero physical visits</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">API Monetization</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">₹50/query</div>
              <div className="text-[10px] text-slate-500">+ ₹45L base ACV</div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Evaluation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Claim Submission & Trigger Configuration */}
        <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Configure & Simulate Policy Claim
            </h3>
            <span className="text-xs text-slate-400">Live Telemetry Sandbox</span>
          </div>

          {/* Underwriter / Carrier Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Underwriting Insurance Carrier:</label>
            <select
              value={selectedInsurer}
              onChange={(e) => setSelectedInsurer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {COMMERCIAL_INSURERS.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name} ({ins.rating} Rated)
                </option>
              ))}
            </select>
          </div>

          {/* Policy Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Parametric Policy Product:</label>
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {PARAMETRIC_POLICIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <span className="font-semibold">Parametric Trigger Rule:</span> {currentPolicy.triggerMetric}
            </div>
          </div>

          {/* Policyholder Details & District */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Policy Number:</label>
              <input
                type="text"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Incident District:</label>
              <select
                value={claimDistrict}
                onChange={(e) => setClaimDistrict(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Chennai">Chennai Metro (Coastal)</option>
                <option value="Cuddalore">Cuddalore (Storm Surge Corridor)</option>
                <option value="Nagapattinam">Nagapattinam (Delta Bay)</option>
                <option value="Salem">Salem (Mettur Kaveri Basin)</option>
                <option value="Tiruvallur">Tiruvallur (Industrial Hub)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Insured Enterprise Entity:</label>
            <input
              type="text"
              value={policyHolderName}
              onChange={(e) => setPolicyHolderName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Sum Insured Claim Amount:</span>
              <span className="font-bold text-emerald-400 font-mono">
                ₹{(claimAmount / 100000).toFixed(1)} Lakhs (₹{claimAmount.toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="500000"
              value={claimAmount}
              onChange={(e) => setClaimAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleVerifyClaim}
            disabled={isVerifying}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Cross-Referencing Live Telemetry Feeds...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> Evaluate & Verify Claim via Live Telemetry
              </>
            )}
          </button>
        </div>

        {/* Right Column: Instant Claim Verdict & Verifiable Dossier */}
        <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                Automated Settlement Decision
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                ISO / IRDAI Standard
              </span>
            </div>

            {claimResult ? (
              <div className="mt-4 space-y-4">
                {/* Result Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    claimResult.triggered
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {claimResult.triggered ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-black text-sm uppercase tracking-wide">
                      {claimResult.status}
                    </div>
                    <p className="text-xs mt-1 text-slate-300">{claimResult.reason}</p>
                  </div>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-700">
                    <span className="text-slate-400">Approved Payout Amount:</span>
                    <div className="text-lg font-black text-white mt-0.5 font-mono">
                      ₹{claimResult.approvedAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-700">
                    <span className="text-slate-400">Claims Settlement Window:</span>
                    <div className="text-lg font-black text-cyan-400 mt-0.5 font-mono">
                      {claimResult.turnaroundHours} Hours
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-700">
                    <span className="text-slate-400">Survey Cost Saved:</span>
                    <div className="text-lg font-black text-emerald-400 mt-0.5 font-mono">
                      {claimResult.surveyorCostSavedINR}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-700">
                    <span className="text-slate-400">Fraud Probability:</span>
                    <div className="text-lg font-black text-purple-400 mt-0.5 font-mono">
                      {claimResult.fraudRiskScore}
                    </div>
                  </div>
                </div>

                {/* Telemetry Sensor Evidence */}
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-cyan-400" /> Sensor Ingestion Evidence
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">24h Rainfall</div>
                      <div className="font-bold text-cyan-300 font-mono">{claimResult.simulatedTelemetry.rainfall24h}</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">Peak Gust</div>
                      <div className="font-bold text-amber-300 font-mono">{claimResult.simulatedTelemetry.windGust}</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">Tidal Surge</div>
                      <div className="font-bold text-blue-300 font-mono">{claimResult.simulatedTelemetry.surge}</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">Dam Outflow</div>
                      <div className="font-bold text-purple-300 font-mono">{claimResult.simulatedTelemetry.damOutflow}</div>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Hash */}
                <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all">
                  <span className="text-cyan-400 font-bold">BLOCK-HASH: </span>
                  {claimResult.certificateHash}
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-12 px-4 space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-slate-300">
                  No Claim Evaluated Yet
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select an underwriter and policy trigger parameters on the left, then click "Evaluate & Verify Claim" to test automated settlement against real sensor feeds.
                </p>
              </div>
            )}
          </div>

          {claimResult && (
            <div className="mt-6 pt-4 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowCertificateModal(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Printer className="h-4 w-4" /> View & Print Claim Certificate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && claimResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Parametric Insurance Settlement Certificate
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official Cryptographic Telemetry Audit by RESQAI InsurTech Gateway
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">INSURER:</span>
                <span className="text-white font-bold">{currentInsurer.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">POLICYHOLDER:</span>
                <span className="text-white">{policyHolderName} ({policyId})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">TRIGGER EVENT:</span>
                <span className="text-cyan-400 font-bold">{currentPolicy.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">DISTRICT / LOCATION:</span>
                <span className="text-white">{claimDistrict}, Tamil Nadu</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">VERIFIED PAYOUT:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ₹{claimResult.approvedAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">SETTLEMENT STATUS:</span>
                <span className="text-emerald-400 font-bold">{claimResult.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VERIFICATION HASH:</span>
                <span className="text-slate-400 text-[10px] break-all">{claimResult.certificateHash}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Export PDF Dossier
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
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
