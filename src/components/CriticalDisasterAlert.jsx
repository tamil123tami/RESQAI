import { useEffect } from "react";
import { X, Siren, Zap, AlertTriangle, Shield, Users } from "lucide-react";
import { useApp } from "../context/AppContext";

const COMMANDER_PHONE = "919843279397";
const CITIZEN_PHONE   = "919843279397";
const SMS_PHONE       = "9843279397";

// ── Commander message (tactical) ─────────────────────────────────────────────
function commanderWhatsApp(d) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const msg =
    `🚨 *CRITICAL DISASTER ALERT* — ResQ EOC TN\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `*Type:* ${d.type}\n` +
    `*Location:* ${d.areaName}\n` +
    `*Risk Level:* ${d.riskPercent}% (${(d.severity || "CRITICAL").toUpperCase()})\n` +
    `*Detected at:* ${time}\n\n` +
    `🔴 *COMMANDER ACTION REQUIRED:*\n` +
    `• Deploy nearest available response teams immediately.\n` +
    `• Alert all medical facilities within 20 km radius.\n` +
    `• Initiate phased civilian evacuation protocol.\n` +
    `• Establish forward command post at safe perimeter.\n` +
    `• Monitor weather & risk escalation every 15 min.\n\n` +
    `📍 *Coordinates:* ${d.lat ? d.lat.toFixed(4) : "N/A"}°N, ${d.lng ? d.lng.toFixed(4) : "N/A"}°E\n` +
    `📻 *Radio:* Command Channel — 156.8 MHz\n` +
    `📞 *Command Hub:* +91-44-XXXX-XXXX\n` +
    `🔗 *Dashboard:* http://localhost:5173`;
  return `https://wa.me/${COMMANDER_PHONE}?text=${encodeURIComponent(msg)}`;
}

function commanderSMS(d) {
  const msg =
    `[RESQ EOC TN] CRITICAL ALERT: ${d.type} at ${d.areaName}. ` +
    `Risk: ${d.riskPercent}%. Deploy teams & alert hospitals immediately. ` +
    `Coords: ${d.lat ? d.lat.toFixed(4) : "?"}N ${d.lng ? d.lng.toFixed(4) : "?"}E`;
  return `sms:${SMS_PHONE}?body=${encodeURIComponent(msg)}`;
}

// ── Citizen message (public, simple language) ─────────────────────────────────
function citizenWhatsApp(d) {
  const msg =
    `⚠️ *EMERGENCY PUBLIC ALERT* — Tamil Nadu Disaster Management\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `A *${d.type}* has been detected near *${d.areaName}*.\n\n` +
    `🔴 *THIS IS A HIGH-RISK SITUATION. PLEASE ACT NOW:*\n\n` +
    `1️⃣ *Evacuate immediately* if you are in a low-lying or flood-prone area.\n` +
    `2️⃣ *Move to higher ground* or the nearest relief shelter.\n` +
    `3️⃣ *Do NOT use roads near waterways* — they may be submerged.\n` +
    `4️⃣ *Call 112* (Emergency) or *1800-425-1188* (Disaster Helpline) for rescue.\n` +
    `5️⃣ *Carry essentials only:* ID, medicines, phone charger, water.\n` +
    `6️⃣ *Help elderly & children first* before evacuating yourself.\n\n` +
    `🏥 *Nearest relief centres and hospitals have been alerted.*\n` +
    `🚑 *Rescue teams are on the way.*\n\n` +
    `📢 *Share this message with your neighbours immediately.*\n\n` +
    `— ResQ Emergency Operations Centre, Tamil Nadu\n` +
    `📞 Emergency: 112 | Helpline: 1800-425-1188`;
  return `https://wa.me/${CITIZEN_PHONE}?text=${encodeURIComponent(msg)}`;
}

function citizenSMS(d) {
  const msg =
    `[TN DISASTER ALERT] ${d.type} warning near ${d.areaName}. ` +
    `EVACUATE NOW to higher ground. Do not use flooded roads. ` +
    `Call 112 for rescue. Share with neighbours. -ResQ EOC TN`;
  return `sms:${SMS_PHONE}?body=${encodeURIComponent(msg)}`;
}

// ── Alert sound ───────────────────────────────────────────────────────────────
function playAlertBeeps() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 250, 500].forEach((delay) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay / 1000);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (delay + 180) / 1000);
      osc.start(ctx.currentTime + delay / 1000);
      osc.stop(ctx.currentTime + (delay + 200) / 1000);
    });
  } catch (_) {}
}

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
function WAIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CriticalDisasterAlert() {
  const { criticalAlert, dismissCriticalAlert } = useApp();

  useEffect(() => {
    if (criticalAlert) playAlertBeeps();
  }, [criticalAlert]);

  if (!criticalAlert) return null;
  const d = criticalAlert;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={dismissCriticalAlert} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl shadow-red-500/30 border border-red-500/50 animate-slide-up my-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-rose-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Siren className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-red-200 font-mono tracking-widest uppercase">Critical Threshold Exceeded</p>
              <h2 className="text-lg font-black text-white">{d.type} — {d.riskPercent}% Risk</h2>
            </div>
          </div>
          <button onClick={dismissCriticalAlert} className="p-1.5 text-red-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-slate-900 px-5 py-5 space-y-5">

          {/* Incident card */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30">
            <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-30" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-600 font-black text-white">
                {d.riskPercent}%
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">{d.areaName}</p>
              <p className="text-red-300 text-xs">Severity: <strong className="uppercase">{d.severity || "critical"}</strong></p>
              {d.lat && <p className="text-slate-400 text-[10px] font-mono mt-0.5">{d.lat.toFixed(4)}°N, {d.lng.toFixed(4)}°E</p>}
            </div>
            <div className="flex items-center gap-1 text-red-400 text-[10px] font-mono bg-red-950 px-2 py-1 rounded-lg border border-red-500/30">
              <Zap className="h-3 w-3" /> LIVE
            </div>
          </div>

          {/* AUTO-SENT banner */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shrink-0">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-300 text-xs font-semibold">Push notifications sent automatically</p>
              <p className="text-emerald-600 text-[10px]">Commander + Citizen alerts fired via ntfy.sh — check your phone</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex gap-2 p-3 rounded-xl bg-yellow-950/40 border border-yellow-500/30">
            <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-200 text-xs leading-relaxed">
              Risk exceeds <strong>75% critical threshold</strong>. Send both alerts below — notify your Commander for tactical response and Citizens for evacuation.
            </p>
          </div>

          {/* ── COMMANDER ALERT ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-violet-500/20">
                <Shield className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <p className="text-violet-300 text-[11px] font-bold uppercase tracking-wider">Commander Alert</p>
              <span className="text-slate-500 text-[10px]">— Tactical, operational details</span>
            </div>

            <a href={commanderWhatsApp(d)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all group">
              <div className="p-1.5 bg-[#25D366]/20 rounded-lg text-[#25D366]"><WAIcon /></div>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">WhatsApp Commander</p>
                <p className="text-slate-400 text-[10px]">Deploy teams · Hospital alert · Forward command</p>
              </div>
              <span className="text-[#25D366] text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </a>

            <a href={commanderSMS(d)}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-violet-950/30 hover:bg-violet-950/50 border border-violet-500/20 transition-all group">
              <div className="p-1.5 bg-violet-500/20 rounded-lg">
                <Shield className="h-4 w-4 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">SMS Commander</p>
                <p className="text-slate-400 text-[10px]">Short tactical alert via SMS (mobile)</p>
              </div>
              <span className="text-violet-400 text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>

          {/* divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-700/60" />
            <span className="text-slate-500 text-[10px] uppercase tracking-wider">also notify</span>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>

          {/* ── CITIZEN ALERT ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-orange-500/20">
                <Users className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <p className="text-orange-300 text-[11px] font-bold uppercase tracking-wider">Citizen Evacuation Alert</p>
              <span className="text-slate-500 text-[10px]">— Simple, public language</span>
            </div>

            <a href={citizenWhatsApp(d)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all group">
              <div className="p-1.5 bg-[#25D366]/20 rounded-lg text-[#25D366]"><WAIcon /></div>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">WhatsApp Citizens</p>
                <p className="text-slate-400 text-[10px]">Evacuate now · Safety steps · Helpline 112</p>
              </div>
              <span className="text-[#25D366] text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </a>

            <a href={citizenSMS(d)}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-orange-950/30 hover:bg-orange-950/50 border border-orange-500/20 transition-all group">
              <div className="p-1.5 bg-orange-500/20 rounded-lg">
                <Users className="h-4 w-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">SMS Citizens</p>
                <p className="text-slate-400 text-[10px]">Short evacuation alert via SMS (mobile)</p>
              </div>
              <span className="text-orange-400 text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>

          <button onClick={dismissCriticalAlert} className="w-full py-2 text-slate-600 hover:text-slate-400 text-xs transition-colors">
            Dismiss (not recommended during active incident)
          </button>
        </div>
      </div>
    </div>
  );
}
