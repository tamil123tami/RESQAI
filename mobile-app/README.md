# ResQ AI — Field Responder Mobile Companion App (React Native)

Production cross-platform React Native & Expo mobile application tailored for NDRF battalions, SDRF field teams, and coastal search-and-rescue units operating in low-connectivity disaster zones.

---

## 🚀 Key Field Responder Capabilities

1. **One-Touch Tactile SOS Beacon**
   - Emits instantaneous high-priority distress GPS fix to State Emergency Operations Center (EOC) with haptic feedback.
   - Automatically queues when offline and transmits over cellular, satellite backhaul, or LoRa mesh.

2. **Hands-Free AI Voice Commander**
   - Web / on-device speech recognition enabling touchless voice command dispatch.
   - Text-to-speech tactical confirmation spoken directly through responder earpieces/headsets.
   - Supports:
     - Casualty logging: *"Triage red 2 victims"*
     - Mission milestones: *"Unit arrived on scene at breach"*
     - Dictation: *"Report water level at 1.8 meters"*
     - Tactical Sitreps: *"Nearest hospital with trauma capacity"*

3. **START Protocol Field Triage Matrix**
   - Simple Triage and Rapid Treatment:
     - **RED**: Immediate life-threatening trauma
     - **YELLOW**: Delayed urgent care
     - **GREEN**: Minor walking wounded
     - **BLACK**: Expectant / Deceased
   - Real-time aggregation synced with State Trauma Registry for hospital bed allocation.

4. **Zero-Connectivity Offline Persistence**
   - High-throughput AsyncStorage / SQLite persistence.
   - Operates normally through full telecommunications blackout.
   - Replays and batch-flushes queued JSON events with conflict resolution upon connection restoration.

---

## 🛠️ Quickstart & Local Execution

### 1. Prerequisites
- Node.js (v18+)
- [Expo Go App](https://expo.dev/go) installed on iOS (App Store) or Android (Google Play Store).

### 2. Install Dependencies
```bash
cd mobile-app
npm install
```

### 3. Launch Development Server
```bash
npx expo start
```

- Scan the QR code with **Expo Go** on your physical phone.
- Or press `a` for Android Emulator / `i` for iOS Simulator / `w` for Web Preview.

### 4. Build Production Standalone APK / iOS IPA
```bash
# Build Android APK for field testing
npx eas build -p android --profile preview

# Build iOS IPA for TestFlight
npx eas build -p ios --profile preview
```

---

## 📂 Project Architecture

```
mobile-app/
├── App.js                         # Root navigation & network state provider
├── app.json                       # Expo application metadata & permissions
├── package.json                   # Mobile dependencies (React Native 0.74+, Expo)
└── src/
    ├── screens/
    │   ├── FieldDashboardScreen.js  # Active mission, GPS telemetry, SOS beacon
    │   ├── TriageMatrixScreen.js    # START casualty classification matrix
    │   ├── VoiceCommanderScreen.js  # Hands-free AI voice command terminal
    │   └── OfflineSyncScreen.js     # On-device queue & blackout network toggle
    └── services/
        ├── LocationTelemetryService.js  # High-accuracy GPS coords & heading
        ├── OfflineStorageService.js     # AsyncStorage offline event queueing
        └── VoiceOpsService.js           # Expo Speech & tactical command parsing
```
