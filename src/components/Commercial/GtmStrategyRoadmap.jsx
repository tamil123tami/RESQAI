import { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Calendar,
  DollarSign,
  Award,
  Shield,
  Building2,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function GtmStrategyRoadmap() {
  const [completedSteps, setCompletedSteps] = useState([0, 1]);

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const gtmPhases = [
    {
      quarter: 'Month 1 - 2: Foundation & Regulatory Entry',
      title: 'DPIIT Startup India & IRDAI Sandbox Registration',
      tag: 'Legal & Compliance',
      tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      actionItems: [
        'Incorporate entity as Private Limited company & apply for DPIIT Startup India certificate.',
        'File application under IRDAI Regulatory Sandbox (Thematic: Climate Risk & Parametric Weather Insurance).',
        'Enroll on Government e-Marketplace (GeM 4.0) under OEM Software Vendor category.',
        'Obtain CERT-In cyber-security audit compliance for emergency telemetry data handling.',
      ],
      revenuePotential: 'Seed Grants & Sandbox Exemption',
    },
    {
      quarter: 'Month 3 - 5: Flagship Government & Insurer Pilots',
      title: 'TNSDMA District Pilot & Insurer API Trial',
      tag: 'Proof of Concept (PoC)',
      tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      actionItems: [
        'Deploy paid pilot in 2 flood-vulnerable districts (Cuddalore & Chennai South) with District Collectors.',
        'Partner with 1 General Insurer (ICICI Lombard or HDFC ERGO) to validate 500 historical cyclone claims against RESQAI telemetry.',
        'Publish peer-reviewed Disaster Mitigation & Loss Aversion Whitepaper with Anna University / IIT Madras.',
        'Demonstrate sub-8 minute field dispatch to NDMA & State EOC controllers.',
      ],
      revenuePotential: '₹25 Lakhs – ₹50 Lakhs (Paid Pilot & Consulting)',
    },
    {
      quarter: 'Month 6 - 8: Non-Dilutive Government Grants & Seed Round',
      title: 'Secure Non-Dilutive Climate Tech Funding',
      tag: 'Funding Influx',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      actionItems: [
        'Apply for Startup India Seed Fund Scheme (SISFS) through designated incubator (₹50 Lakhs grant/convertible debenture).',
        'Apply for MeitY TIDE 2.0 / NASSCOM DeepTech grant (up to ₹30 Lakhs non-dilutive grant).',
        'Submit proposal to National Disaster Risk Management Fund (NDRMF) under capacity-building window.',
        'Pitch to Climate-Tech & GovTech VC syndicates (Speciale Invest, Blume Ventures, Omnivore).',
      ],
      revenuePotential: '₹1.25 Cr – ₹2.5 Cr Non-Dilutive Capital',
    },
    {
      quarter: 'Month 9 - 12: Commercial Scale & ARR Expansion',
      title: 'Full State EOC Contract & B2B Port Subscriptions',
      tag: 'Commercial Scale',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      actionItems: [
        'Execute full multi-year SaaS contract with Tamil Nadu SDMA (TNSDMA) via GeM custom bid (₹2.2 Cr/year).',
        'Sign B2B InsurTech Parametric API agreements with 3 General Insurers at ₹45L base ACV + ₹50/query.',
        'Enroll 5 Mega Infrastructure assets (Chennai Port, Ennore Port, Foxconn Sriperumbudur) at ₹25L/hub/yr.',
        'Expand pilot to adjacent disaster-prone coastal states: Odisha (OSDMA) and Andhra Pradesh (APSDMA).',
      ],
      revenuePotential: '₹4.8 Cr – ₹7.5 Cr Year 1 ARR',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="h-4 w-4 text-amber-400" /> Execution Roadmap
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Go-To-Market (GTM) & Commercialization Playbook
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              A pragmatic 12-month commercial execution strategy designed to take RESQAI from prototype to a ₹52 Crore ARR Enterprise GovTech & InsurTech market leader.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-center shrink-0 w-full lg:w-auto">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Achievable ARR (Y3)</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">₹52.0 Crores</div>
            <div className="text-[11px] text-cyan-400 font-mono">24 States + 35 Insurers</div>
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        {gtmPhases.map((phase, idx) => {
          const isDone = completedSteps.includes(idx);
          return (
            <div
              key={idx}
              className={`rounded-2xl border p-6 transition-all ${
                isDone
                  ? 'bg-slate-800/90 border-emerald-500/40'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStep(idx)}
                    className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      isDone ? 'bg-emerald-500 text-white' : 'border border-slate-600 hover:border-emerald-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <div>
                    <span className="text-xs font-semibold text-slate-400">{phase.quarter}</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{phase.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${phase.tagColor}`}>
                    {phase.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                    {phase.revenuePotential}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {phase.actionItems.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                  >
                    <span className="text-cyan-400 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grant & Non-Dilutive Funding Directory */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Top 4 Non-Dilutive Funding Programs for RESQAI
          </h3>
          <p className="text-xs text-slate-400">
            Apply to these government initiatives to fund R&D and team scaling without sacrificing equity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-700/80 space-y-1.5">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">Startup India Seed Fund (SISFS)</h4>
              <span className="text-xs font-mono font-bold text-emerald-400">Up to ₹50 Lakhs</span>
            </div>
            <p className="text-xs text-slate-400">
              Disbursed through approved incubators (e.g. IIT Madras Incubation Cell, Anna University). Supports proof-of-concept, prototype development, and product trials.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-700/80 space-y-1.5">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">MeitY TIDE 2.0 (DeepTech Scheme)</h4>
              <span className="text-xs font-mono font-bold text-emerald-400">Up to ₹30 Lakhs</span>
            </div>
            <p className="text-xs text-slate-400">
              Technology Incubation and Development of Entrepreneurs grant for AI/IoT solutions addressing national societal challenges like flood mitigation.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-700/80 space-y-1.5">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">NDMA National Innovation Fund</h4>
              <span className="text-xs font-mono font-bold text-emerald-400">₹1 Cr – ₹2.5 Cr</span>
            </div>
            <p className="text-xs text-slate-400">
              Grants allocated under 15th Finance Commission SDRMF for technology-driven disaster decision support systems and common alerting protocol tools.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-700/80 space-y-1.5">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">SIDBI Green Climate / Tech Fund</h4>
              <span className="text-xs font-mono font-bold text-emerald-400">Soft Loans & Equity</span>
            </div>
            <p className="text-xs text-slate-400">
              Concessional financing for climate resilience technologies and enterprise disaster loss mitigation software.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
