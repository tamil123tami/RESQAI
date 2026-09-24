/**
 * Auto-Notification Service — ResQ AI
 *
 * Uses ntfy.sh (free, no account, CORS-enabled push notification service).
 * Phone receives push notifications via the free ntfy app (Android / iOS).
 *
 * Setup (2 min):
 *  1. Install "ntfy" app on your phone from Play Store / App Store.
 *  2. Open the app → tap "+" → subscribe to topic: resq-tn-alerts
 *  3. Done. Alerts fire automatically when a critical disaster is detected.
 *
 * No API key, no account, no backend needed.
 */

const NTFY_BASE   = "https://ntfy.sh";
const TOPIC_CMD   = "resq-tn-alerts-cmd";      // Commander channel
const TOPIC_PUB   = "resq-tn-alerts-public";   // Citizen / public channel

// ── Send a push notification via ntfy.sh ─────────────────────────────────────
async function sendNtfy({ topic, title, message, priority = "urgent", tags = "rotating_light,sos" }) {
  try {
    const resp = await fetch(`${NTFY_BASE}/${topic}`, {
      method: "POST",
      headers: {
        "Title":    title,
        "Priority": priority,
        "Tags":     tags,
        "Content-Type": "text/plain",
      },
      body: message,
    });
    if (!resp.ok) throw new Error(`ntfy error: ${resp.status}`);
    console.log(`[ResQ] Push sent to ntfy topic "${topic}" ✓`);
    return true;
  } catch (err) {
    console.warn(`[ResQ] ntfy push failed:`, err.message);
    return false;
  }
}

// ── Helper to format optional fields ───────────────────────────────────────────
const formatOptionals = (obj) => {
  let str = "";
  if (obj.weather) str += `Weather: ${obj.weather}\n`;
  if (obj.distance) str += `Distance: ${obj.distance}\n`;
  return str;
};

// ── Commander alert (tactical) ────────────────────────────────────────────────
export async function sendCommanderAlert(disaster) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return sendNtfy({
    topic:    TOPIC_CMD,
    title:    `CRITICAL: ${disaster.type} at ${disaster.areaName}`,
    message:
      `Risk: ${disaster.riskPercent}% (${disaster.severity || "CRITICAL"})\n` +
      `Time: ${time}\n` +
      `Coords: ${disaster.lat ? disaster.lat.toFixed(4) : "N/A"}N, ${disaster.lng ? disaster.lng.toFixed(4) : "N/A"}E\n` +
      formatOptionals(disaster) +
      `\nACTIONS:\n` +
      `• Deploy teams\n` +
      `• Alert 20km hospitals\n` +
      `• Start evacuation`,
    priority: "urgent",
    tags: "rotating_light,police_car_light",
  });
}

// ── Citizen alert (public language) ──────────────────────────────────────────
export async function sendCitizenAlert(disaster) {
  return sendNtfy({
    topic:    TOPIC_PUB,
    title:    `EMERGENCY: ${disaster.type} near ${disaster.areaName}`,
    message:
      `Evacuate to higher ground immediately.\n` +
      formatOptionals(disaster) +
      `\n` +
      `• Carry ID, meds, water\n` +
      `• Help elderly/children\n\n` +
      `EMERGENCY: 112\nHELPLINE: 1800-425-1188`,
    priority: "urgent",
    tags: "warning,loudspeaker",
  });
}


// ── Recall alert ──────────────────────────────────────────────────────────────
export async function sendRecallAlert(team) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return sendNtfy({
    topic:    TOPIC_CMD,
    title:    `RECALL: ${team.name}`,
    message:
      `Time: ${time}\n` +
      `Leader: ${team.leader} (${team.members} members)\n\n` +
      `RETURN TO BASE IMMEDIATELY.\n` +
      `Radio: ${team.radio || "Command channel"}`,
    priority: "high",
    tags: "mega",
  });
}

// ── Deploy alert ──────────────────────────────────────────────────────────────
export async function sendDeployAlert(team, location, mission) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return sendNtfy({
    topic:    TOPIC_CMD,
    title:    `DEPLOY: ${team.name} -> ${location}`,
    message:
      `Time: ${time}\n` +
      `Mission: ${mission}\n` +
      `Leader: ${team.leader} (${team.members} members)\n` +
      formatOptionals(team) +
      `\nDepart immediately. Check in on arrival.\n` +
      `Radio: ${team.radio || "Command channel"}`,
    priority: "high",
    tags: "truck",
  });
}

// ── SOS Alert (Commander channel) ─────────────────────────────────────────────
export async function sendSOSAlert(beacon) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return sendNtfy({
    topic:    TOPIC_CMD,
    title:    `SOS: ${beacon.type} at ${beacon.areaName || "Unknown Location"}`,
    message:
      `Time: ${time} | Src: ${beacon.source || "Mobile"}\n` +
      `Contact: ${beacon.contact || "Unknown"}\n` +
      `People: ${beacon.peopleCount || "Unknown"}\n` +
      formatOptionals(beacon) +
      `\nMSG: ${beacon.message}\n` +
      `Coords: ${beacon.lat ? beacon.lat.toFixed(4) : "N/A"}N, ${beacon.lng ? beacon.lng.toFixed(4) : "N/A"}E`,
    priority: "urgent",
    tags: "sos,rotating_light",
  });
}

export const NTFY_TOPICS = { TOPIC_CMD, TOPIC_PUB };
