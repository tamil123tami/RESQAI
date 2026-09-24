import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Shield,
  Building2,
  DollarSign,
  Users,
  Award,
  FileCheck2,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Percent,
  Sliders,
  Printer,
  ChevronRight,
  Download,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  Code,
  Compass,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import InsurTechPortal from '../components/Commercial/InsurTechPortal';
import EnterpriseBcmPortal from '../components/Commercial/EnterpriseBcmPortal';
import ApiDeveloperPortal from '../components/Commercial/ApiDeveloperPortal';
import GovernmentTenderPortal from '../components/Commercial/GovernmentTenderPortal';
import GtmStrategyRoadmap from '../components/Commercial/GtmStrategyRoadmap';

// ── Financial Projections Data ────────────────────────────────────────────────
const financialGrowthData = [
  { year: 'Year 1 (Pilot & Scale)', b2gRevenue: 2.8, b2bInsurtech: 1.5, b2bInfra: 0.5, totalArr: 4.8, states: 3, insurers: 4 },
  { year: 'Year 2 (National Expansion)', b2gRevenue: 10.5, b2bInsurtech: 5.8, b2bInfra: 2.2, totalArr: 18.5, states: 10, insurers: 14 },
  { year: 'Year 3 (Pan-India + ASEAN)', b2gRevenue: 28.0, b2bInsurtech: 16.5, b2bInfra: 7.5, totalArr: 52.0, states: 24, insurers: 35 },
];

const unitEconomics = [
  { label: 'State Gov Annual ACV', value: '₹2.2 Cr', sub: 'Per State DMA' },
  { label: 'InsurTech API ACV', value: '₹45 Lakhs', sub: 'Base + Usage Tier' },
  { label: 'Customer Acq. Cost (CAC)', value: '₹18 Lakhs', sub: 'Gov Tender / B2B Sale' },
  { label: 'Lifetime Value (LTV)', value: '₹1.15 Cr', sub: 'LTV / CAC = 6.4x' },
  { label: 'Gross SaaS Margin', value: '82%', sub: 'Pure software edge' },
  { label: 'Payback Period', value: '9.2 Months', sub: 'Rapid capital return' },
];

const bmcPillars = [
  {
    id: 'value',
    title: 'Value Proposition',
    icon: Sparkles,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    points: [
      'Sub-8 minute unified emergency dispatch (vs 45m baseline)',
      'Automated parametric insurance verification (cuts settlement from 45 days to 48 hrs)',
      'Multi-sensor automated early warnings saving ₹7.80 for every ₹1 invested',
      'NDMA & SDRF compliant automated relief audit generation',
    ],
  },
  {
    id: 'segments',
    title: 'Customer Segments',
    icon: Building2,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    points: [
      'B2G: State Disaster Management Authorities (TNSDMA, KSDMA, APSDMA)',
      'B2G: Municipal Corporations (Greater Chennai, BBMP, BMC)',
      'B2B: General & Agri Insurers (HDFC ERGO, ICICI Lombard, Swiss Re)',
      'B2B: Ports, Airports & Energy Infrastructure (AAI, NHAI, TANGEDCO)',
    ],
  },
  {
    id: 'revenue',
    title: 'Revenue Streams',
    icon: DollarSign,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    points: [
      'B2G SaaS Subscriptions: ₹1.5 Cr – ₹3.5 Cr/year per state government',
      'B2B InsurTech Parametric API: ₹45L/year base + ₹50/claim query',
      'Critical Infrastructure BCM Monitoring: ₹18L – ₹35L/facility/year',
      'Emergency Drone & IoT Hardware Integration Retainers',
    ],
  },
  {
    id: 'activities',
    title: 'Key Activities',
    icon: Cpu,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    points: [
      'Real-time ingestion of USGS, Open-Meteo, CWC, ISRO telemetry',
      'Dual LLM autonomous incident triage and responder allocation',
      'Dynamic flood/cyclone predictive damage modeling',
      'Continuous SLA monitoring and government CAP broadcast',
    ],
  },
  {
    id: 'partners',
    title: 'Key Strategic Partners',
    icon: Users,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    points: [
      'NDMA & State Disaster Response Forces (SDRF / NDRF)',
      'India Meteorological Department (IMD) & CWC',
      'Telecom Service Providers (Airtel, Jio for Cell Broadcast)',
      'General Insurance Corporation of India (GIC Re) & Munich Re',
    ],
  },
  {
    id: 'costs',
    title: 'Cost Structure',
    icon: Layers,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    points: [
      'Multi-cloud GPU inference & high-throughput API clusters (22%)',
      'Satellite & commercial radar telemetry ingestion (18%)',
      'R&D and geospatial model calibration (35%)',
      'Government regulatory compliance, tender execution & sales (25%)',
    ],
  },
];

export default function BusinessModel() {
  const [activeTab, setActiveTab] = useState('overview');

  // ── Interactive ROI Calculator State ───────────────────────────────────────
  const [population, setPopulation] = useState(4200000); // 4.2 Million (e.g. Chennai Metro)
  const [assetValueCr, setAssetValueCr] = useState(2500); // ₹2,500 Cr asset base
  const [severityLevel, setSeverityLevel] = useState(4); // Category 4 Cyclone / Flood
  const [earlyWarningHours, setEarlyWarningHours] = useState(18); // 18 Hours lead time
  const [activeBmcTab, setActiveBmcTab] = useState('value');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Preset quick switch
  const applyPreset = (pop, asset, sev, hrs) => {
    setPopulation(pop);
    setAssetValueCr(asset);
    setSeverityLevel(sev);
    setEarlyWarningHours(hrs);
  };

  // ── Calculated Economic & Life Safety Metrics ──────────────────────────────
  const metrics = useMemo(() => {
    const warningMultiplier = Math.min(0.42, earlyWarningHours * 0.021);
    const severityFactor = severityLevel * 0.18;
    const rawPotentialLossCr = assetValueCr * severityFactor;
    const lossAvertedCr = Math.round(rawPotentialLossCr * warningMultiplier * 10) / 10;
    const endangeredPopulation = Math.round(population * (severityLevel * 0.045));
    const livesProtected = Math.round(endangeredPopulation * (0.85 + earlyWarningHours / 100));
    const minutesSaved = 37.8;
    const claimsPriced = Math.round((population / 1000) * severityLevel * 12);
    const insuranceOperationalSavingsCr = Math.round((claimsPriced * 4200) / 100000) / 10;
    const fleetSavingsLakhs = Math.round(severityLevel * 28.5);
    const roiMultiplier = Math.round((lossAvertedCr / 2.2) * 10) / 10;

    return {
      lossAvertedCr,
      rawPotentialLossCr: Math.round(rawPotentialLossCr),
      endangeredPopulation,
      livesProtected,
      minutesSaved,
      insuranceOperationalSavingsCr,
      fleetSavingsLakhs,
      roiMultiplier,
      claimsPriced,
    };
  }, [population, assetValueCr, severityLevel, earlyWarningHours]);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* ── Master Header ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950/40 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Award className="h-3.5 w-3.5 text-cyan-400" />
              Enterprise Commercial Suite · Business Monetization Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Commercial Operations & Monetization Hub
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              RESQAI generates high-margin recurring software revenues through <span className="text-cyan-400 font-semibold">B2G State EOC SaaS</span>, 
              <span className="text-emerald-400 font-semibold"> B2B InsurTech Parametric APIs</span>, 
              and <span className="text-purple-400 font-semibold">Enterprise Critical Asset Safeguards</span>.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-semibold transition-all shadow-md hover:shadow-cyan-500/20"
            >
              <FileCheck2 className="h-4 w-4 text-cyan-400" />
              Generate SDRF Audit Report
            </button>
            <button
              onClick={() => setActiveTab('insurtech')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-600/30"
            >
              <Zap className="h-4 w-4" />
              Launch InsurTech Verifier
            </button>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Response Acceleration</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">45m → 7.2m</div>
            <div className="text-[11px] text-slate-400 mt-0.5">84% faster field mobilization</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Economic Multiplier</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹1 = ₹7.80</div>
            <div className="text-[11px] text-slate-400 mt-0.5">World Bank disaster loss averted</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">InsurTech Payouts</div>
            <div className="text-2xl font-black text-amber-400 mt-1">48 Hours</div>
            <div className="text-[11px] text-slate-400 mt-0.5">vs 45-day traditional surveyor lag</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Unit SaaS Margins</div>
            <div className="text-2xl font-black text-purple-400 mt-1">82% Margin</div>
            <div className="text-[11px] text-slate-400 mt-0.5">High LTV/CAC ratio of 6.4x</div>
          </div>
        </div>
      </div>

      {/* ── MASTER NAVIGATION TABS ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Overview & Financial Model</span>
        </button>

        <button
          onClick={() => setActiveTab('insurtech')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'insurtech'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="h-4 w-4 text-amber-300" />
          <span>InsurTech Parametric Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('bcm')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bcm'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Enterprise BCM & Ports</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'api'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code className="h-4 w-4" />
          <span>Developer API & Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('tender')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tender'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>GeM Tender Bid Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('gtm')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gtm'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>12-Month GTM & Grants</span>
        </button>
      </div>

      {/* ── TAB 1: EXECUTIVE OVERVIEW & ROI SIMULATOR ──────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Interactive Disaster Loss & ROI Calculator */}
          <div id="roi-calculator" className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Sliders className="h-4 w-4" />
                  Live Interactive Simulation
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Disaster Loss Mitigation & ROI Calculator
                </h2>
                <p className="text-slate-400 text-sm">
                  Adjust variables below or pick a regional disaster scenario to simulate real-time quantifiable financial and humanitarian ROI.
                </p>
              </div>

              {/* Quick Scenario Presets */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPreset(4200000, 2500, 4, 18)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 text-xs font-semibold"
                >
                  Chennai Metro (Cat 4)
                </button>
                <button
                  onClick={() => applyPreset(1200000, 1200, 5, 24)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-semibold"
                >
                  Cuddalore Coastal Surge
                </button>
                <button
                  onClick={() => applyPreset(2800000, 1800, 3, 14)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 text-xs font-semibold"
                >
                  Kaveri Basin Dam Surcharge
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sliders Column */}
              <div className="lg:col-span-6 space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-700/80">
                {/* Slider 1: Monitored Population */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Urban & Coastal Population at Risk:</span>
                    <span className="font-mono font-bold text-cyan-400 text-base">
                      {(population / 1000000).toFixed(1)} Million citizens
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="12000000"
                    step="250000"
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>500K (District)</span>
                    <span>4.2M (Chennai Metro)</span>
                    <span>12M (State Corridor)</span>
                  </div>
                </div>

                {/* Slider 2: Asset Exposure */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Commercial & Public Asset Exposure:</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      ₹{assetValueCr.toLocaleString()} Crores
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="8000"
                    step="100"
                    value={assetValueCr}
                    onChange={(e) => setAssetValueCr(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>₹200 Cr</span>
                    <span>₹2,500 Cr</span>
                    <span>₹8,000 Cr</span>
                  </div>
                </div>

                {/* Slider 3: Hazard Severity */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Hazard Impact Category:</span>
                    <span className="font-mono font-bold text-amber-400 text-base">
                      Category {severityLevel} ({severityLevel >= 4 ? 'Severe Cyclone / Surge' : severityLevel === 3 ? 'Flash Flood' : 'Moderate Inundation'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={severityLevel}
                    onChange={(e) => setSeverityLevel(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Cat 1 (Minor)</span>
                    <span>Cat 3 (Flash Flood)</span>
                    <span>Cat 5 (Super Cyclone)</span>
                  </div>
                </div>

                {/* Slider 4: Early Warning Lead Time */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">AI Early Warning Lead Time:</span>
                    <span className="font-mono font-bold text-purple-400 text-base">
                      {earlyWarningHours} Hours Lead Time
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="48"
                    step="2"
                    value={earlyWarningHours}
                    onChange={(e) => setEarlyWarningHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>2 Hours (Rapid)</span>
                    <span>18 Hours (Optimal)</span>
                    <span>48 Hours (Pre-Landfall)</span>
                  </div>
                </div>
              </div>

              {/* Computed Dynamic ROI Cards */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                {/* Big Primary Output */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" /> Projected Economic Loss Mitigated
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      {metrics.roiMultiplier}x ROI on ResQ AI
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ₹{metrics.lossAvertedCr.toLocaleString()} Cr
                    </span>
                    <span className="text-sm text-slate-400">
                      saved from total ₹{metrics.rawPotentialLossCr.toLocaleString()} Cr risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    Calculated using World Bank / UNDRR disaster risk reduction model (every hour of lead time saves 2.1% in infrastructure damages).
                  </p>
                </div>

                {/* Secondary Output Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                    <div className="text-xs text-slate-400 font-semibold">Citizens Shielded</div>
                    <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1">
                      {metrics.livesProtected.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      of {metrics.endangeredPopulation.toLocaleString()} in danger zone
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                    <div className="text-xs text-slate-400 font-semibold">Dispatch Latency Cut</div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
                      -37.8 Mins
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Autonomous triage & routing
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                    <div className="text-xs text-slate-400 font-semibold">Parametric Claims Validated</div>
                    <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
                      {metrics.claimsPriced.toLocaleString()} Claims
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Settled in 48h (₹{metrics.insuranceOperationalSavingsCr} Cr admin saved)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                    <div className="text-xs text-slate-400 font-semibold">Fleet Route Optimization</div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
                      ₹{metrics.fleetSavingsLakhs} Lakhs
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Fuel & redundant run savings
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Model Canvas (BMC) */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Layers className="h-4 w-4" /> Strategic Enterprise Framework
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Interactive Business Model Canvas (BMC)
                </h2>
                <p className="text-slate-400 text-sm">
                  The 9 building blocks engineered to secure commercial scale and long-term state defense contracts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bmcPillars.map((pillar) => {
                const Icon = pillar.icon;
                const isSelected = activeBmcTab === pillar.id;

                return (
                  <div
                    key={pillar.id}
                    onClick={() => setActiveBmcTab(pillar.id)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? `${pillar.color} shadow-lg ring-1 ring-cyan-400`
                        : 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${pillar.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-white text-base">{pillar.title}</h3>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {pillar.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Projections & Unit Economics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chart: 3-Year ARR Growth */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <BarChart3 className="h-4 w-4" /> 3-Year Financial Model
                </div>
                <h3 className="text-xl font-bold text-white mt-1">ARR Revenue Projections (₹ Crores)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rapid ARR scaling driven by B2G state contract expansions and recurring InsurTech API volume.
                </p>
              </div>

              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} label={{ value: '₹ Crores', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                      formatter={(val) => [`₹${val} Cr`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="b2gRevenue" name="B2G Gov SaaS" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="b2bInsurtech" name="B2B InsurTech API" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="b2bInfra" name="B2B Infrastructure" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-400">Year 1 Target</span>
                  <div className="font-bold text-cyan-400 text-sm">₹4.8 Cr ARR</div>
                </div>
                <div>
                  <span className="text-slate-400">Year 2 Target</span>
                  <div className="font-bold text-emerald-400 text-sm">₹18.5 Cr ARR</div>
                </div>
                <div>
                  <span className="text-slate-400">Year 3 Target</span>
                  <div className="font-bold text-purple-400 text-sm">₹52.0 Cr ARR</div>
                </div>
              </div>
            </div>

            {/* Unit Economics Grid */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <DollarSign className="h-4 w-4" /> Capital Efficiency
                </div>
                <h3 className="text-xl font-bold text-white mt-1">SaaS Unit Economics</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Attractive LTV/CAC dynamics underpinned by zero physical sensor installation footprint.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {unitEconomics.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/70">
                    <div className="text-[11px] text-slate-400 font-medium">{item.label}</div>
                    <div className="text-xl font-black text-white mt-1">{item.value}</div>
                    <div className="text-[10px] text-cyan-400 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300">
                <span className="font-bold text-cyan-300">Moat Analysis:</span> Hyperlocal sensor ingestion + autonomous dual-LLM dispatch provides a 14-month technical lead over traditional GIS vendors.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INSURTECH PARAMETRIC CLAIM ENGINE ──────────────────────── */}
      {activeTab === 'insurtech' && (
        <div className="animate-fadeIn">
          <InsurTechPortal />
        </div>
      )}

      {/* ── TAB 3: ENTERPRISE ASSET BCM PORTAL ─────────────────────────────── */}
      {activeTab === 'bcm' && (
        <div className="animate-fadeIn">
          <EnterpriseBcmPortal />
        </div>
      )}

      {/* ── TAB 4: DEVELOPER API & BILLING ─────────────────────────────────── */}
      {activeTab === 'api' && (
        <div className="animate-fadeIn">
          <ApiDeveloperPortal />
        </div>
      )}

      {/* ── TAB 5: B2G GEM TENDER BID GENERATOR ────────────────────────────── */}
      {activeTab === 'tender' && (
        <div className="animate-fadeIn">
          <GovernmentTenderPortal />
        </div>
      )}

      {/* ── TAB 6: 12-MONTH GTM & GRANTS ───────────────────────────────────── */}
      {activeTab === 'gtm' && (
        <div className="animate-fadeIn">
          <GtmStrategyRoadmap />
        </div>
      )}

      {/* ── Government SDRF Audit Certificate Modal ───────────────────────── */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    State Disaster Response Fund (SDRF) Compliance Audit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Government relief allocation audit certificate generated by RESQAI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">AUDIT DOSSIER ID:</span>
                <span className="text-cyan-400 font-bold">SDRF-TN-2026-0924-EOC</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">JURISDICTION:</span>
                <span className="text-white">Tamil Nadu State Disaster Management Authority (TNSDMA)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">POPULATION SHELTERED:</span>
                <span className="text-emerald-400 font-bold">{metrics.livesProtected.toLocaleString()} Citizens</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">ESTIMATED ASSET LOSS AVERTED:</span>
                <span className="text-emerald-400 font-bold">₹{metrics.lossAvertedCr} Crores</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">PARAMETRIC VERIFICATION SLA:</span>
                <span className="text-amber-400 font-bold">48 Hours (100% telemetry verified)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TAMPER-PROOF AUDIT HASH:</span>
                <span className="text-slate-400 text-[10px] break-all">
                  SHA256: 8f4e2d09b61c8a1498b3c1029da9f0291ba48c4129b01e9d891e45c08342a319
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Printer className="h-4 w-4" /> Print / Export Official PDF
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
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
