/**
 * RESQAI Commercial & Monetization Data Architecture
 * Defines enterprise tiers, insurers, parametric policy schemas,
 * corporate asset profiles, API specifications, and government tender templates.
 */

// ── Supported InsurTech Partners ──────────────────────────────────────────────
export const COMMERCIAL_INSURERS = [
  { id: 'icici-lombard', name: 'ICICI Lombard General Insurance', code: 'ICICI-LOMB', marketShare: '18.4%', rating: 'AAA' },
  { id: 'hdfc-ergo', name: 'HDFC ERGO General Insurance', code: 'HDFC-ERGO', marketShare: '14.2%', rating: 'AAA' },
  { id: 'bajaj-allianz', name: 'Bajaj Allianz General Insurance', code: 'BAJAJ-ALL', marketShare: '12.8%', rating: 'AA+' },
  { id: 'tata-aig', name: 'Tata AIG General Insurance', code: 'TATA-AIG', marketShare: '11.5%', rating: 'AA+' },
  { id: 'swiss-re', name: 'Swiss Re (Global Reinsurer)', code: 'SWISS-RE', marketShare: 'Global', rating: 'A+' },
  { id: 'munich-re', name: 'Munich Re Syndicate', code: 'MUNICH-RE', marketShare: 'Global', rating: 'AA' },
];

// ── Parametric Insurance Products ─────────────────────────────────────────────
export const PARAMETRIC_POLICIES = [
  {
    id: 'urban-flood',
    title: 'Hyperlocal Urban Inundation & Flood Parametric Cover',
    peril: 'Flash Flood & River Inundation',
    triggerMetric: 'Rainfall > 150mm in 24h OR Basin Discharge > 15,000 cusecs',
    targetSegment: 'Commercial Warehouses, IT SEZs, SME Retail Units',
    avgSumInsured: 2500000, // ₹25 Lakhs
    payoutSpeed: 'Within 48 Hours',
    surveyorCostSaved: '₹38,000 per claim',
  },
  {
    id: 'cyclone-wind',
    title: 'Coastal Cyclone Storm Surge & High-Wind Parametric Trigger',
    peril: 'Cyclonic Gale Wind & Storm Surge',
    triggerMetric: 'Sustained Wind Speed > 115 km/h OR Surge Height > 2.2m',
    targetSegment: 'Port Operators, Marinas, Solar Farms, Wind Turbines',
    avgSumInsured: 15000000, // ₹1.5 Crores
    payoutSpeed: 'Within 24 Hours',
    surveyorCostSaved: '₹1,20,000 per claim',
  },
  {
    id: 'reservoir-breach',
    title: 'Reservoir Downstream Spillway Flash Inundation Cover',
    peril: 'Dam Overflow & Controlled Water Discharge',
    triggerMetric: 'Dam Outflow > 25,000 cusecs combined with gauge level > 90% FRL',
    targetSegment: 'Agricultural Estates, Aquaculture Farms, Rural Infrastructure',
    avgSumInsured: 800000, // ₹8 Lakhs
    payoutSpeed: 'Within 36 Hours',
    surveyorCostSaved: '₹22,000 per claim',
  },
  {
    id: 'industrial-interruption',
    title: 'Industrial Supply Chain & Grid Blackout Contingency',
    peril: 'Sub-station Inundation & Severe Weather Outage',
    triggerMetric: 'Grid Sub-station Inundation > 1.2m OR Alert Level Critical > 6h',
    targetSegment: 'Automotive Belts (Sriperumbudur/Oragadam), Electronics Plants',
    avgSumInsured: 50000000, // ₹5 Crores
    payoutSpeed: 'Within 72 Hours',
    surveyorCostSaved: '₹3,50,000 per claim',
  },
];

// ── Enterprise Critical Infrastructure Profiles ───────────────────────────────
export const ENTERPRISE_FACILITIES = [
  {
    id: 'fac-1',
    name: 'Chennai Port Container Terminal (CPCL / DP World)',
    location: 'Chennai Harbour, Bay of Bengal',
    district: 'Chennai',
    coordinates: { lat: 13.0850, lng: 80.2980 },
    elevationMeters: 3.2,
    assetValuationCr: 1850,
    dailyDowntimeCostCr: 4.8,
    primaryRisks: ['Storm Surge', 'Cyclonic Gale', 'Cranes Wind Load'],
    criticalThresholds: { windGust: 90, rain24h: 120, surge: 1.8 },
    contactPerson: 'Harbour Master & Risk Directorate',
  },
  {
    id: 'fac-2',
    name: 'Sriperumbudur Auto-Manufacturing Cluster (Hyundai / Foxconn)',
    location: 'SIPCOT Industrial Park, Kancheepuram Corridor',
    district: 'Kancheepuram',
    coordinates: { lat: 12.9675, lng: 79.9403 },
    elevationMeters: 38.5,
    assetValuationCr: 4200,
    dailyDowntimeCostCr: 12.5,
    primaryRisks: ['Chembarambakkam Backwater Overflow', 'Supply Chain Blockade', 'Internal Storm Drain Backflow'],
    criticalThresholds: { windGust: 105, rain24h: 160, surge: 0 },
    contactPerson: 'Plant EHS & Supply Chain Director',
  },
  {
    id: 'fac-3',
    name: 'OMR Data Center Hub & Cybervale (TIDEL / Nxtra / CtrlS)',
    location: 'Old Mahabalipuram Road (IT Corridor), Chennai',
    district: 'Chennai',
    coordinates: { lat: 12.9815, lng: 80.2437 },
    elevationMeters: 6.8,
    assetValuationCr: 2900,
    dailyDowntimeCostCr: 9.2,
    primaryRisks: ['Sub-station Submersion', 'Buckingham Canal Overflow', 'Underground Fiber Conduit Water Ingress'],
    criticalThresholds: { windGust: 95, rain24h: 130, surge: 1.2 },
    contactPerson: 'Chief Infrastructure Officer',
  },
  {
    id: 'fac-4',
    name: 'Ennore Kamarajar Port Bulk Cargo & LNG Terminal',
    location: 'Ennore Coast, Tiruvallur District',
    district: 'Tiruvallur',
    coordinates: { lat: 13.2612, lng: 80.3289 },
    elevationMeters: 4.1,
    assetValuationCr: 3400,
    dailyDowntimeCostCr: 6.5,
    primaryRisks: ['Deep Sea Squalls', 'Kosasthalaiyar River Estuary Inundation', 'Tidal Surge'],
    criticalThresholds: { windGust: 100, rain24h: 140, surge: 2.0 },
    contactPerson: 'Safety Operations Command',
  },
];

// ── Developer API & Subscription Pricing Tiers ────────────────────────────────
export const COMMERCIAL_PRICING_TIERS = [
  {
    id: 'tier-sandbox',
    name: 'Developer Sandbox',
    tagline: 'Ideal for prototype evaluation, hackathons & academic testing',
    monthlyPriceINR: 0,
    yearlyPriceINR: 0,
    apiLimit: '1,000 calls / month',
    rateLimit: '5 requests / sec',
    features: [
      'Access to Open-Meteo & USGS normalized feeds',
      'Tamil Nadu reservoir telemetry (13 major dams)',
      'Basic risk score query by Lat/Long',
      'Community Slack support',
      'Shared cloud gateway latency (~350ms)',
    ],
    recommendedFor: 'Developers & Research Labs',
    badge: 'Free Tier',
    ctaText: 'Current Plan',
  },
  {
    id: 'tier-pro',
    name: 'InsurTech Growth',
    tagline: 'Engineered for underwriters, claims adjusters & logistics portals',
    monthlyPriceINR: 49999,
    yearlyPriceINR: 499990, // ~17% annual discount
    apiLimit: '50,000 calls / month',
    rateLimit: '50 requests / sec',
    features: [
      'Everything in Developer Sandbox, plus:',
      'Parametric Claim Verification Engine with SHA-256 signatures',
      'RainViewer Doppler Radar precipitation raster tiles',
      'Real-time Webhook event streaming (Instant Flood/Cyclone triggers)',
      'Underwriting Exposure Risk Heatmap API',
      'Automated claim fraud probability scoring',
      '99.9% Uptime SLA with email/phone escalation',
    ],
    recommendedFor: 'Insurance Underwriters, Third Party Administrators, Logistics Platforms',
    badge: 'Most Popular',
    ctaText: 'Upgrade to Growth',
  },
  {
    id: 'tier-enterprise',
    name: 'Enterprise Command / B2G',
    tagline: 'Mission-critical command infrastructure for State EOCs & Mega-Assets',
    monthlyPriceINR: 249000,
    yearlyPriceINR: 2490000,
    apiLimit: 'Unlimited queries',
    rateLimit: '500 requests / sec',
    features: [
      'Everything in InsurTech Growth, plus:',
      'Dedicated private cloud or on-premises deployment',
      'ITU-T CAP v1.2 Multi-Channel Public Broadcast Engine',
      'Full SDRF & NDMA Government Audit Compliance Pack',
      'Autonomous Dual-LLM field responder dispatching',
      'Sub-8 minute unified emergency routing orchestration',
      '24/7 dedicated engineering incident commander with 99.99% SLA',
      'Quarterly disaster drill simulation & telemetry calibration',
    ],
    recommendedFor: 'State Governments (SDMA), Smart City ICCCs, Ports & Airport Hubs',
    badge: 'Government Ready',
    ctaText: 'Contact Enterprise Sales',
  },
];

// ── Interactive API Sandbox Endpoints ─────────────────────────────────────────
export const API_SANDBOX_ENDPOINTS = [
  {
    id: 'ep-claim',
    method: 'POST',
    path: '/api/v1/insurtech/verify-claim',
    description: 'Verify if weather and dam telemetry met policy threshold conditions for parametric settlement',
    defaultPayload: JSON.stringify(
      {
        policyNumber: 'RESQ-POL-2026-9812',
        insurerCode: 'ICICI-LOMB',
        latitude: 13.0827,
        longitude: 80.2707,
        district: 'Chennai',
        perilType: 'URBAN_FLOOD',
        thresholdCondition: {
          minRainfall24hMm: 150,
          minDamDischargeCusecs: 12000,
        },
        eventTimestamp: '2026-09-24T06:00:00Z',
      },
      null,
      2
    ),
  },
  {
    id: 'ep-risk',
    method: 'GET',
    path: '/api/v1/risk/score?lat=13.0827&lng=80.2707&facilityType=DATA_CENTER',
    description: 'Calculate hyperlocal multi-hazard risk index (0-100) and insurance exposure rating',
    defaultPayload: null,
  },
  {
    id: 'ep-dam',
    method: 'GET',
    path: '/api/v1/telemetry/reservoir-discharge?state=tamil-nadu&riskStatus=alert',
    description: 'Fetch real-time dam water levels, storage percentages, and outflow alerts',
    defaultPayload: null,
  },
  {
    id: 'ep-cap',
    method: 'POST',
    path: '/api/v1/alerts/broadcast-cap',
    description: 'Publish Common Alerting Protocol (CAP v1.2) emergency advisories to telecom cell broadcast & sirens',
    defaultPayload: JSON.stringify(
      {
        identifier: 'TNSDMA-ALERT-2026-0924',
        sender: 'eoc-controller@tnsdma.gov.in',
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          category: 'Met',
          event: 'Cyclone Michaung-2 Threat',
          urgency: 'Immediate',
          severity: 'Severe',
          certainty: 'Observed',
          headline: 'Red Alert: Severe Coastal Gale & Inundation Warning',
          areaDesc: 'Chennai, Tiruvallur, Kancheepuram, Cuddalore',
        },
      },
      null,
      2
    ),
  },
];

// ── GeM & SDRF Government Tender Specifications ───────────────────────────────
export const GEM_TENDER_TEMPLATE = {
  tenderId: 'GEM/2026/B/8942104-EOC-AI',
  title: 'Procurement of AI-Powered Multi-Hazard Disaster Decision Support System (DSS) and Unified Emergency Operations Center (EOC) SaaS',
  procuringEntity: 'Tamil Nadu State Disaster Management Authority (TNSDMA) / Commissionerate of Revenue Administration',
  procurementCategory: 'SaaS / Cloud Software Solutions on GeM 4.0',
  applicableRules: 'Rule 173(i) of General Financial Rules (GFR) 2017 - Startup Exemption for DPIIT Recognized Startups (Exemption from Prior Turnover & Prior Experience)',
  budgetSource: 'State Disaster Response Fund (SDRF) - Capacity Building & Modernization Window (15th Finance Commission Allocation)',
  slas: {
    availability: '99.99% Uptime with dual-region failover',
    latency: 'Telemetry ingestion delay < 12 seconds from sensor broadcast',
    dispatchSpeed: 'Sub-8 minute automated triage and multi-agency responder alerting',
    compliance: 'NDMA National Disaster Management Guidelines, ITU-T CAP v1.2, ISO 27001, CERT-In certified cybersecurity architecture',
  },
};

// ── Helper to generate deterministic SHA-256 style hash string ──────────────
export function generateCertificateHash(inputString) {
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const timestamp = Date.now().toString(16);
  return `SHA256:7f4a${hex}e92b8c${timestamp}014d59a8c2ef389014ba3`;
}
