import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Notifications from '../Notifications';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Bell,
  Map,
  Building2,
  Users,
  CheckSquare,
  FileText,
  RotateCcw,
  Radio,
  Droplets,
  DollarSign,
  Smartphone,
  ShieldAlert,
  Shield,
  Zap,
  Sparkles,
  TrendingUp,
  Download,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck2,
  X
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mobile', icon: Smartphone, label: 'Field Operations' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/hospitals', icon: Building2, label: 'Hospitals' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/tasks', icon: CheckSquare, label: 'Operations' },
  { to: '/dams', icon: Droplets, label: 'Dams & Telemetry' },
  { to: '/reports', icon: FileText, label: 'EOC & Audit Reports' },
  { to: '/admin', icon: Shield, label: 'AI Admin' },
  { to: '/demo', icon: Zap, label: 'Demo Controls' },
];

const hazardTypeConfig = {
  flood: { label: 'Flood', color: 'from-blue-500 to-blue-700' },
  cyclone: { label: 'Cyclone', color: 'from-cyan-500 to-teal-600' },
  earthquake: { label: 'Earthquake', color: 'from-amber-500 to-orange-600' },
  'volcanic-eruption': { label: 'Volcanic Eruption', color: 'from-red-500 to-rose-700' },
  wildfire: { label: 'Wildfire', color: 'from-orange-500 to-red-600' },
  landslide: { label: 'Landslide', color: 'from-yellow-600 to-orange-600' },
};

function Layout({ children }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const { resetToDefaults, getStats, disasters } = useApp();
  const stats = getStats();

  // Get unique active disaster types
  const activeHazardTypes = [...new Set(disasters.filter(d => d.status !== 'completed').map(d => d.type))];
  const hazardBadges = activeHazardTypes
    .map(type => hazardTypeConfig[type])
    .filter(Boolean);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{background: '#0f172a', color: '#f1f5f9'}}>
      {/* Global Notifications */}
      <Notifications />

      {/* Sidebar */}
      <aside className="flex h-full w-[72px] flex-col items-center py-4 gap-1 shrink-0" style={{backgroundColor: '#1e293b', borderRight: '1px solid #334155'}}>
        {/* Logo */}
        <div className="mb-4 flex flex-col items-center justify-center gap-1">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="w-10 border-t border-gray-200 mb-2" />

        {/* Nav Items */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/' || location.pathname === '/dashboard'
                : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                end
                className="group relative"
                aria-label={label}
              >
                <div
                  style={{
                    display: 'flex',
                    height: '44px',
                    width: '44px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? '#06b6d4' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#334155';
                      e.currentTarget.style.color = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Tooltip */}
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-md bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                </div>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between px-6 shrink-0" style={{backgroundColor: '#1e293b', borderBottom: '1px solid #334155'}}>
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              <span style={{color: '#06b6d4'}}>
                ResQ AI
              </span>
            </h1>
            <span className="hidden sm:inline-block h-4 w-px" style={{backgroundColor: '#334155'}} />
            <span className="hidden sm:inline-block text-sm font-medium" style={{color: '#cbd5e1'}}>
              Emergency Operations Center
            </span>
          </div>

          {/* Center: Active Hazard Badges - Only show when disasters exist */}
          {hazardBadges.length > 0 && (
            <div className="hidden lg:flex items-center gap-2">
              {hazardBadges.map(({ label, color }) => (
                <span
                  key={label}
                  className={`inline-flex items-center rounded-full bg-gradient-to-r ${color} px-3 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase shadow-sm animate-pulse`}
                  title={`Active ${label} Disaster`}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* No Active Disasters - Show Safe Status */}
          {hazardBadges.length === 0 && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 px-4 py-1 text-xs font-bold tracking-wide uppercase shadow-lg">
                ✓ All Clear
              </span>
            </div>
          )}

          {/* Right: Status + Controls */}
          <div className="flex items-center gap-3">
            {/* SOS Alert Badge */}
            {stats.pendingSosCount > 0 && (
              <NavLink
                to="/reports"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
                title={`${stats.pendingSosCount} pending civilian distress signals`}
              >
                <Radio className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                <span>{stats.pendingSosCount} SOS</span>
              </NavLink>
            )}

            {/* Field Operations Mobile Pill */}
            <NavLink
              to="/mobile"
              className="hidden md:flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-purple-500/30 text-xs font-semibold text-slate-200 transition-colors"
              title="Open Field Mobile Operations Console"
            >
              <Smartphone className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-purple-300 font-bold">FIELD OPS</span>
            </NavLink>

            {/* Commercial Enterprise License & Monetization Hub Trigger */}
            <button
              onClick={() => setShowEnterpriseModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-300 transition-all shadow-sm shadow-emerald-500/10"
              title="Enterprise Commercial Operations & Monetization Engine"
            >
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden xl:inline text-slate-300 font-normal">License:</span>
              <span className="text-emerald-400 font-mono font-bold">ENTERPRISE TIER-1</span>
              <span className="hidden lg:inline text-[10px] px-1.5 py-0.2 bg-emerald-500/30 text-emerald-200 rounded font-mono">
                ₹482.6Cr Protected
              </span>
            </button>

            {/* Quick Reset Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo disasters, deployments, and storage to factory defaults?')) {
                  resetToDefaults();
                }
              }}
              title="Reset state to initial defaults"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <div className="hidden md:flex items-center gap-2.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs text-emerald-400 font-bold tracking-wide uppercase">
                24/7 EOC
              </span>
            </div>

            <div className="flex flex-col items-end leading-none bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700">
              <span className="text-base font-mono font-bold text-white tabular-nums">
                {formattedTime}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {formattedDate}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{backgroundColor: '#0f172a'}}>
          {children}
        </main>

        {/* Enterprise Commercial Monetization & Billing Ledger Modal */}
        {showEnterpriseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <DollarSign className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        Enterprise Commercial Operations & Monetization Suite
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        ACTIVE CONTRACT
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Client: Tamil Nadu State Disaster Management Authority & Critical Infrastructure Enterprise Tenant
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEnterpriseModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Commercial Monetization Streams */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active SaaS Tier</span>
                  <p className="text-lg font-black text-white">B2G Enterprise</p>
                  <p className="text-xs text-emerald-400 font-mono font-bold">₹24,50,000 / month</p>
                  <span className="text-[10px] text-slate-500">Multi-Agency EOC Operations</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">B2B InsurTech Feeds</span>
                  <p className="text-lg font-black text-cyan-400">342 Claim Queries</p>
                  <p className="text-xs text-cyan-300 font-mono font-bold">₹11,97,000 billed (@ ₹3.5k/ea)</p>
                  <span className="text-[10px] text-slate-500">ICICI Lombard, Swiss Re, HDFC</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Industrial Retainers</span>
                  <p className="text-lg font-black text-amber-400">18 Facilities</p>
                  <p className="text-xs text-amber-300 font-mono font-bold">₹18,00,000 ARR</p>
                  <span className="text-[10px] text-slate-500">Ports, IT Parks & Power Plants</span>
                </div>
              </div>

              {/* Value Protected Ledger */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-200 tracking-wider">
                    Disaster Economic Loss Mitigation Ledger (World Bank / NDMA Standard)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ROI: ₹7.80 Loss Mitigated per ₹1 Platform Fee
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Asset Value Protected</span>
                    <strong className="text-white text-sm">₹482.60 Crores</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Billable Missions Dispatched</span>
                    <strong className="text-white text-sm">142 Missions</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Parametric Claims Cleared</span>
                    <strong className="text-white text-sm">₹38.40 Crores</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Guaranteed Dispatch SLA</span>
                    <strong className="text-emerald-400 text-sm">99.98% (&lt; 3 mins)</strong>
                  </div>
                </div>
              </div>

              {/* How This Platform Generates Real Revenue */}
              <div className="space-y-2 text-xs text-slate-300">
                <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">
                  Core Revenue Streams & Business Mechanics:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">Government Disaster Grants (SDRF / NDRF)</strong>
                      <span className="text-[11px] text-slate-400">Generates certified disaster compliance audits allowing state authorities to clear central disaster relief payouts.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <TrendingUp className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">InsurTech Parametric Claim Settling</strong>
                      <span className="text-[11px] text-slate-400">Insurance companies pay ₹3,500/query for verified flood polygons and dam discharge timestamps to settle claims in 48 hours.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <Bell className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">Commercial Early Warning Subscriptions</strong>
                      <span className="text-[11px] text-slate-400">Manufacturing units, logistics parks, and private ports pay annual subscriptions for 45-min dam discharge & flood advance warnings.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <Lock className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">Metered API & Drone Telemetry Units</strong>
                      <span className="text-[11px] text-slate-400">Private ambulance networks, hospital ICUs, and commercial drone operators pay micro-fees for real-time corridor access.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <NavLink
                  to="/reports"
                  onClick={() => setShowEnterpriseModal(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20"
                >
                  <FileText className="h-4 w-4" /> Open EOC Audit & InsurTech Claim Dossiers
                </NavLink>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      alert('Enterprise Monthly SLA Billing Statement generated & downloaded (Invoice #EOC-SLA-2026-0924).');
                      setShowEnterpriseModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                  >
                    <Download className="h-4 w-4 text-emerald-400" />
                    <span>Download SLA Billing Statement</span>
                  </button>
                  <button
                    onClick={() => setShowEnterpriseModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Layout;
