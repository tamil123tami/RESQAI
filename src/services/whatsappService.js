/**
 * WhatsApp Click-to-Chat Service
 * Uses the wa.me deep-link API — no backend, no API key needed.
 * Opens WhatsApp Web (desktop) or WhatsApp app (mobile) with a pre-filled message.
 *
 * Phone format: country code + number, NO spaces/dashes/+
 * India example: 919876543210  (91 = country code, 9876543210 = number)
 */

const COMMAND_HQ = "RESQ-EOC-TN";
const FALLBACK_PHONE = "919843279397"; // used when team.phone not yet in localStorage cache

// Build a wa.me URL for a given phone + message
export function buildWhatsAppUrl(phone, message) {
  const num = phone || FALLBACK_PHONE;
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${num}?text=${encoded}`;
}

// Open WhatsApp in a new tab
export function openWhatsApp(phone, message) {
  const url = buildWhatsAppUrl(phone, message);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

// ── Message Templates ─────────────────────────────────────────────────────────

export function buildRecallMessage(team) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    `🚨 *RESQ-RECALL-ALL* — ${COMMAND_HQ}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `*Team:* ${team.name}\n` +
    `*Leader:* ${team.leader}\n` +
    `*Issued at:* ${time}\n\n` +
    `🔴 *ORDER:* Return to base immediately.\n` +
    `• Secure all equipment & personnel.\n` +
    `• Complete patient/civilian handover before moving.\n` +
    `• Report status on arrival via ResQ app.\n\n` +
    `📻 Radio: ${team.radio || "Command channel"}\n` +
    `📞 Command Hub: +91-44-XXXX-XXXX`
  );
}

export function buildDeployMessage(team, location, mission) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    `🚀 *RESQ-DEPLOY ORDER* — ${COMMAND_HQ}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `*Team:* ${team.name}\n` +
    `*Leader:* ${team.leader}\n` +
    `*Issued at:* ${time}\n\n` +
    `🎯 *Mission:* ${mission}\n` +
    `📍 *Deploy to:* ${location}\n\n` +
    `• Depart immediately with full kit.\n` +
    `• Check in on arrival via ResQ app.\n` +
    `• Report any field obstacles to command.\n\n` +
    `📻 Radio: ${team.radio || "Command channel"}\n` +
    `📞 Command Hub: +91-44-XXXX-XXXX`
  );
}

export function buildSOSAlertMessage(team, sos) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    `🚨 *SOS DISPATCH* — ${COMMAND_HQ}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `*Team:* ${team.name}\n` +
    `*Issued at:* ${time}\n\n` +
    `*Civilian:* ${sos.senderName || "Unknown"}\n` +
    `*Location:* ${sos.areaName}\n` +
    `*Type:* ${sos.type}\n` +
    `*People:* ${sos.peopleCount || 1}\n` +
    `*Message:* "${sos.message}"\n\n` +
    `• Proceed to location immediately.\n` +
    `• Contact: ${sos.contact || "Via ResQ app"}\n` +
    `• Report rescue status on completion.\n\n` +
    `📻 Radio: ${team.radio || "Command channel"}`
  );
}

// Build recall links for multiple teams at once
export function buildGroupRecallLinks(teams) {
  return teams.map((t) => ({
    team: t,
    url: buildWhatsAppUrl(t.phone, buildRecallMessage(t)),
  }));
}
