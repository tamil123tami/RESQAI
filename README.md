# RESQAI - AI-Powered Disaster Management & Emergency Response System

RESQAI is a real-time emergency operations center (EOC) dashboard built for Tamil Nadu disaster management. It provides multi-hazard monitoring, AI-powered risk analysis, dam water-level tracking, and coordinated emergency response.

## Tech Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **Routing**: React Router v6
- **AI**: Groq + Gemini LLM integration

## Features

**Commercial Monetization & Enterprise Hub (`/business`)** - Full-fledged commercialization engine comprising:
- **InsurTech Parametric Claim Verifier**: Instant automated telemetry-backed claim evaluation for ICICI Lombard, HDFC ERGO, Swiss Re, etc., cutting surveyor lag from 45 days to 48 hours with tamper-evident SHA-256 cryptographic certificates.
- **Enterprise Asset Safeguard & BCM**: Infrastructure vulnerability profiling for ports (Chennai/Ennore), auto-clusters (Sriperumbudur), and IT parks (OMR) with business interruption financial exposure calculators and exportable BCP dossiers.
- **Developer API Gateway & Billing**: Live key provisioning (`resq_live_...`), interactive REST console with cURL/Python/Node.js snippets, tiered pricing plans (₹0 to ₹2.49L/mo), and GST tax invoice generation.
- **B2G GeM Tender Bid Generator**: Prepares government tender RFP responses conforming to NDMA standards and DPIIT Startup India exemptions under GFR 2017 Rule 173(i).
- **12-Month GTM & Grants Roadmap**: Interactive execution tracker with access to non-dilutive grant programs (MeitY TIDE 2.0, SISFS ₹50L, NDMA Fund).
- **Disaster Loss Mitigation & ROI Calculator**: Dynamic scenario presets (Chennai Metro, Cuddalore Coastal Surge, Kaveri Basin Surcharge) demonstrating ₹1 = ₹7.80 loss averted.

**Real-Time Telemetry Center (`/telemetry`)** - Multi-district live atmospheric telemetry streamed via Open-Meteo, real-time regional & global seismic events from USGS, Bay of Bengal coastal wave & swell buoys, CWC reservoir hydro-telemetry, and live network latency & JSON packet inspector.

**Live Doppler Weather Radar (`/map`)** - Interactive precipitation Doppler radar tile overlay powered by RainViewer API with live USGS earthquake pins.

**Dashboard** - Live statistics, hazard risk overview, sensor data (rainfall, water level, wind speed, seismic), and alert ticker.

**Dam Monitoring** - Real-time water levels for 13 dams supplying water to Tamil Nadu, including Kaveri basin dams in Karnataka (KRS, Kabini, Hemavathy).

**Alerts & Communication** - Public advisories and controller notifications with priority levels (Critical, Warning, Info) and CAP v1.2 compliance.

**Area Analysis** - Interactive heatmap with priority-based risk visualization across monitored districts.

**Hospitals** - Bed availability, ambulance tracking, and emergency-ready facility status.

**ResQ Teams** - Deployment tracking for 5 specialized response units with equipment inventory.

**AI Copilot** - LLM-powered assistant with intent detection for autonomous team dispatch, WhatsApp alerts, and ambulance routing.

**Incident Reports** - Field reporting and mission status tracking.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
```

## Build & Deploy

```bash
npm run build
```

The `dist/` folder is ready for deployment to Netlify, Vercel, or any static host.

## Project Structure

```
src/
  App.jsx                  # Root component with routing
  main.jsx                 # Entry point
  pages/                   # Page components
    Dashboard.jsx          # Main operations center
    Dams.jsx               # Dam water level monitoring
    Alerts.jsx             # Alert management
    MapView.jsx            # Interactive map
    Hospitals.jsx          # Hospital & medical tracking
    Teams.jsx              # ResQ team deployment
    Recommendations.jsx    # Action items & measures
    IncidentReports.jsx    # Field incident reports
    MissionStatus.jsx      # Mission tracking
    FieldTasks.jsx         # Field task management
    AdminDashboard.jsx     # Admin panel
  components/
    Layout/                # App layout & navigation
    AICopilot/             # AI assistant chatbot
    LiveDataDashboard.jsx  # Real-time data widgets
    ResourceTracker.jsx    # Resource management
    Notifications.jsx      # Notification system
  services/
    weatherService.js      # OpenWeather API integration
    liveDataService.js     # Real-time data feeds
    llmIntegration.js      # Groq & Gemini AI
    locationService.js     # Geolocation services
    dataIntegration.js     # Data aggregation
    notificationService.js # Push notifications
    whatsappService.js     # WhatsApp alerts
  data/
    damData.js             # Tamil Nadu dam telemetry
    mockData.js            # Demo/fallback data
  context/                 # React context providers
```

## License

MIT
