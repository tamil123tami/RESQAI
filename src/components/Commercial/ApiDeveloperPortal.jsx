import { useState } from 'react';
import {
  Code,
  Key,
  Copy,
  Check,
  Send,
  Terminal,
  Layers,
  Zap,
  DollarSign,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  COMMERCIAL_PRICING_TIERS,
  API_SANDBOX_ENDPOINTS,
} from '../../data/commercialData';

export default function ApiDeveloperPortal() {
  const [apiKeyLive, setApiKeyLive] = useState('resq_live_9f82a1e04b78c9014b2d88');
  const [apiKeyTest, setApiKeyTest] = useState('resq_test_3c19e5d77a09b4412e87ab');
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_SANDBOX_ENDPOINTS[0]);
  const [requestPayload, setRequestPayload] = useState(API_SANDBOX_ENDPOINTS[0].defaultPayload || '');
  const [responseOutput, setResponseOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [codeLang, setCodeLang] = useState('curl');
  const [activePlanModal, setActivePlanModal] = useState(null);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  const handleCopy = (text, keyType) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyType);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setRequestPayload(ep.defaultPayload || '');
    setResponseOutput(null);
  };

  const handleExecuteApi = () => {
    setIsExecuting(true);
    setResponseOutput(null);

    setTimeout(() => {
      let mockResult = {};

      if (selectedEndpoint.id === 'ep-claim') {
        mockResult = {
          status: 'SUCCESS',
          code: 200,
          data: {
            claimId: 'CLM-PARAMETRIC-98124',
            policyVerified: true,
            telemetryMatch: {
              source: 'Open-Meteo & IMD Radars',
              recordedRainfallMm: 184.2,
              thresholdRequiredMm: 150.0,
              triggered: true,
            },
            settlementDecision: 'INSTANT_PAYOUT_APPROVED',
            payoutAmountINR: 2500000,
            cryptographicHash: 'SHA256:7f4ae92b8c17751918a24c014d59',
            processedInMs: 38,
          },
        };
      } else if (selectedEndpoint.id === 'ep-risk') {
        mockResult = {
          status: 'SUCCESS',
          code: 200,
          data: {
            coordinates: { lat: 13.0827, lng: 80.2707 },
            location: 'Chennai Metro Central',
            overallMultiHazardIndex: 78.4,
            perilBreakdown: {
              floodInundationRisk: 'High (84/100)',
              cycloneWindRisk: 'High (76/100)',
              seismicVulnerability: 'Low (18/100)',
            },
            nearestReservoir: { name: 'Chembarambakkam Lake', distanceKm: 24.2, outflowCusecs: 450 },
            recommendedInsuranceRetentionRatio: '45% primary / 55% reinsurance treaty',
          },
        };
      } else if (selectedEndpoint.id === 'ep-dam') {
        mockResult = {
          status: 'SUCCESS',
          code: 200,
          data: {
            state: 'Tamil Nadu',
            monitoredReservoirsCount: 13,
            alertDams: [
              { name: 'Mettur Dam', river: 'Kaveri', storagePercent: 73.2, outflowCusecs: 12403, status: 'Active Outflow' },
              { name: 'Bhavanisagar', river: 'Bhavani', storagePercent: 50.5, outflowCusecs: 2150, status: 'Normal' },
            ],
            telemetrySyncTimestamp: new Date().toISOString(),
          },
        };
      } else {
        mockResult = {
          status: 'BROADCAST_QUEUED',
          code: 202,
          data: {
            broadcastId: 'CAP-TN-2026-0924-EOC-01',
            recipientsTargeted: 4850000,
            channels: ['Cell Broadcast (CBCS)', 'Emergency Sirens', 'WhatsApp Gov Alert'],
            priority: 'CRITICAL_MET_WARNING',
            acknowledgedByTelecomGateways: true,
          },
        };
      }

      setResponseOutput({
        statusCode: 200,
        latencyMs: Math.floor(Math.random() * 25) + 30,
        payload: mockResult,
      });
      setIsExecuting(false);
    }, 600);
  };

  const getCodeSnippet = () => {
    const url = `https://api.resqai.in${selectedEndpoint.path}`;
    if (codeLang === 'curl') {
      if (selectedEndpoint.method === 'POST') {
        return `curl -X POST "${url}" \\\n  -H "Authorization: Bearer ${apiKeyLive}" \\\n  -H "Content-Type: application/json" \\\n  -d '${requestPayload.replace(/\n/g, '')}'`;
      }
      return `curl -X GET "${url}" \\\n  -H "Authorization: Bearer ${apiKeyLive}"`;
    }
    if (codeLang === 'python') {
      if (selectedEndpoint.method === 'POST') {
        return `import requests\n\nurl = "${url}"\nheaders = {\n    "Authorization": "Bearer ${apiKeyLive}",\n    "Content-Type": "application/json"\n}\npayload = ${requestPayload || '{}'}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`;
      }
      return `import requests\n\nurl = "${url}"\nheaders = {"Authorization": "Bearer ${apiKeyLive}"}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`;
    }
    // Node.js
    if (selectedEndpoint.method === 'POST') {
      return `const response = await fetch("${url}", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer ${apiKeyLive}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(${requestPayload || '{}'})\n});\nconst data = await response.json();\nconsole.log(data);`;
    }
    return `const response = await fetch("${url}", {\n  headers: { "Authorization": "Bearer ${apiKeyLive}" }\n});\nconst data = await response.json();\nconsole.log(data);`;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/40 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Code className="h-4 w-4 text-cyan-400" /> Developer Platform & Self-Serve Billing
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Enterprise Telemetry & Risk Scoring API Gateway
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Monetize every API query. Insurers, logistics providers, and fintechs integrate RESQAI’s high-throughput telemetry, flood predictions, and parametric settlement webhooks directly into their core software.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-2 w-full lg:w-auto shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-cyan-400" /> Production Live Key:
              </span>
              <button
                onClick={() => handleCopy(apiKeyLive, 'live')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold text-[11px]"
              >
                {copiedKey === 'live' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === 'live' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-xs text-white bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              {apiKeyLive.substring(0, 14)}•••••••••••
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Subscription Tiers Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white">Commercial Subscription Plans</h3>
          <p className="text-xs text-slate-400">
            Transparent self-serve pricing with instant activation and compliant GST tax invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMMERCIAL_PRICING_TIERS.map((tier) => {
            const isPro = tier.id === 'tier-pro';
            return (
              <div
                key={tier.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between shadow-xl relative ${
                  isPro
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-cyan-500/50 ring-1 ring-cyan-400/50'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                {tier.badge && (
                  <div
                    className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPro ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tier.badge}
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-bold text-white">{tier.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{tier.tagline}</p>

                  <div className="my-5 pb-4 border-b border-slate-700/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">
                        ₹{tier.monthlyPriceINR.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>
                    <div className="text-[11px] text-cyan-400 mt-1 font-mono">
                      Limit: {tier.apiLimit} ({tier.rateLimit})
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60">
                  <button
                    onClick={() => {
                      setActivePlanModal(tier);
                      setInvoiceSuccess(false);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isPro
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" /> {tier.ctaText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive API Sandbox Runner */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Terminal className="h-4 w-4" /> Live Interactive Sandbox
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5">REST API Testing Console</h3>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
            {['curl', 'python', 'javascript'].map((lang) => (
              <button
                key={lang}
                onClick={() => setCodeLang(lang)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-colors ${
                  codeLang === lang ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {API_SANDBOX_ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono">{ep.path.split('?')[0]}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-400">{selectedEndpoint.description}</p>

        {/* Code Snippet Box */}
        <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
          <button
            onClick={() => handleCopy(getCodeSnippet(), 'code')}
            className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800/80 px-2 py-1 rounded text-[11px] flex items-center gap-1"
          >
            {copiedKey === 'code' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiedKey === 'code' ? 'Copied' : 'Copy Code'}
          </button>
          <pre>{getCodeSnippet()}</pre>
        </div>

        {/* Payload Editor & Execution Runner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Request Payload (JSON):
            </label>
            <textarea
              rows={8}
              value={requestPayload}
              disabled={selectedEndpoint.method === 'GET'}
              onChange={(e) => setRequestPayload(e.target.value)}
              placeholder={selectedEndpoint.method === 'GET' ? 'No request body for GET requests' : 'Enter JSON payload'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              onClick={handleExecuteApi}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isExecuting ? (
                <>Sending Request...</>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Send Request to Live Gateway
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Gateway Response:
              </label>
              {responseOutput && (
                <span className="text-[11px] font-mono text-emerald-400">
                  HTTP {responseOutput.statusCode} · {responseOutput.latencyMs}ms
                </span>
              )}
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-52 overflow-y-auto font-mono text-xs text-emerald-400">
              {responseOutput ? (
                <pre>{JSON.stringify(responseOutput.payload, null, 2)}</pre>
              ) : (
                <div className="text-slate-600 flex items-center justify-center h-full">
                  Click &apos;Send Request to Live Gateway&apos; to view live output
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Invoice Simulation Modal */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    GST Tax Invoice Preview
                  </h3>
                  <p className="text-xs text-slate-400">
                    RESQAI Technologies Private Limited · SAC Code 998314
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePlanModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">SUBSCRIPTION TIER:</span>
                <span className="text-white font-bold">{activePlanModal.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">BASE MONTHLY AMOUNT:</span>
                <span className="text-white">₹{activePlanModal.monthlyPriceINR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">GST (18% - CGST 9% + SGST 9%):</span>
                <span className="text-white">
                  ₹{Math.round(activePlanModal.monthlyPriceINR * 0.18).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-bold">TOTAL PAYABLE:</span>
                <span className="text-emerald-400 font-black text-sm">
                  ₹{Math.round(activePlanModal.monthlyPriceINR * 1.18).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API QUOTA ALLOCATED:</span>
                <span className="text-cyan-400 font-bold">{activePlanModal.apiLimit}</span>
              </div>
            </div>

            {invoiceSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">Subscription Activated Successfully!</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Your production rate limits have been upgraded to {activePlanModal.rateLimit}.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              {!invoiceSuccess ? (
                <button
                  onClick={() => setInvoiceSuccess(true)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" /> Simulate Corporate Payment
                </button>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Print GST Invoice
                </button>
              )}
              <button
                onClick={() => setActivePlanModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
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
