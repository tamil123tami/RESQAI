/**
 * Hands-Free Voice Operations & Speech Synthesis Service (React Native)
 * Provides speech synthesis audio playback and voice tactical intent parsing.
 */

import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export const VoiceOpsService = {
  /**
   * Speak tactical confirmation back to responder through headset
   */
  async speakTacticalResponse(text) {
    try {
      await Speech.stop();
      await Speech.speak(text, {
        language: 'en-IN',
        pitch: 1.0,
        rate: 1.05,
      });
    } catch (e) {
      console.warn('Speech playback failed:', e);
    }
  },

  /**
   * Trigger tactical haptic pulse
   */
  async triggerHaptic(type = 'heavy') {
    try {
      if (type === 'sos') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (e) {
      // Haptics not available in simulator
    }
  },

  /**
   * Parse spoken query into structured field commands
   */
  parseSpokenQuery(transcript) {
    const q = transcript.toLowerCase();

    if (q.includes('sos') || q.includes('mayday') || q.includes('distress') || q.includes('officer down')) {
      return {
        action: 'TRIGGER_SOS',
        reply: 'Emergency distress beacon activated! Transmitting high-priority GPS fix to Central EOC.',
      };
    }

    if (q.includes('red') && (q.includes('triage') || q.includes('casualty') || q.includes('victim') || q.includes('add'))) {
      const matchNum = q.match(/\b(\d+)\b/);
      const count = matchNum ? parseInt(matchNum[1], 10) : 1;
      return {
        action: 'LOG_TRIAGE',
        triageType: 'red',
        count,
        reply: `Logged ${count} critical red priority casualty. Notifying nearest trauma bay.`,
      };
    }

    if (q.includes('yellow') && (q.includes('triage') || q.includes('casualty') || q.includes('victim') || q.includes('add'))) {
      const matchNum = q.match(/\b(\d+)\b/);
      const count = matchNum ? parseInt(matchNum[1], 10) : 1;
      return {
        action: 'LOG_TRIAGE',
        triageType: 'yellow',
        count,
        reply: `Logged ${count} delayed yellow priority casualty. Bed availability allocated.`,
      };
    }

    if (q.includes('green') && (q.includes('triage') || q.includes('casualty') || q.includes('victim') || q.includes('add'))) {
      const matchNum = q.match(/\b(\d+)\b/);
      const count = matchNum ? parseInt(matchNum[1], 10) : 1;
      return {
        action: 'LOG_TRIAGE',
        triageType: 'green',
        count,
        reply: `Logged ${count} minor green walking wounded to triage relief camp.`,
      };
    }

    if (q.includes('on scene') || q.includes('arrived')) {
      return {
        action: 'UPDATE_STATUS',
        status: 'ON_SCENE',
        reply: 'Roger Echo Unit. Timestamp logged on scene at Adyar Delta breach.',
      };
    }

    if (q.includes('triage complete') || q.includes('triage done')) {
      return {
        action: 'UPDATE_STATUS',
        status: 'TRIAGE_DONE',
        reply: 'Triage assessment complete. Preparing patient transit manifests.',
      };
    }

    if (q.includes('hospital') || q.includes('nearest medical')) {
      return {
        action: 'GET_HOSPITAL',
        reply: 'Nearest medical facility: Government General Hospital Chennai, 2.4 km away. 18 ICU beds vacant.',
      };
    }

    if (q.includes('sitrep') || q.includes('status')) {
      return {
        action: 'GET_SITREP',
        reply: 'SITREP: Mission #842 Active. Adyar Causeway breach. Rain rate 34 mm/hr. 12 civilians awaiting evacuation.',
      };
    }

    return {
      action: 'GENERAL_MEMO',
      reply: `Field note recorded: "${transcript}". Cached in local queue.`,
      note: transcript,
    };
  }
};
