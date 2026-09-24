// Utility service for Geolocation, Nominatim Geocoding, Distance & Location Analysis
import { generateFallbackWeather } from './weatherService';

/**
 * Calculates distance in kilometers between two GPS coordinates (Haversine formula)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Estimates road transit time in minutes/hours based on average speed
 */
export function calculateTransitEta(distanceKm, speedKmh = 40) {
  if (distanceKm == null || isNaN(distanceKm)) return 'N/A';
  const minutes = Math.ceil((distanceKm / speedKmh) * 60);
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return `${hrs}h ${remMins}m`;
}

/**
 * Automatically computes hazard vulnerability zone based on coordinates & geography
 */
export function determineZone(latitude, longitude, addressObj = {}) {
  const dist = (addressObj.state_district || addressObj.county || '').toLowerCase();
  const city = (addressObj.city || addressObj.town || '').toLowerCase();
  const area = (addressObj.neighbourhood || addressObj.suburb || '').toLowerCase();

  // Coastal zone (Zone IV - High Cyclone & Coastal Surge)
  const isCoastal = 
    dist.includes('chennai') || dist.includes('cuddalore') || dist.includes('nagapattinam') ||
    dist.includes('kanyakumari') || dist.includes('thoothukudi') || dist.includes('tiruvallur') ||
    city.includes('chennai') || city.includes('cuddalore') || city.includes('ponneri') ||
    area.includes('ponneri') || area.includes('velachery') || area.includes('royapuram') ||
    longitude > 80.12 || (latitude >= 11.4 && latitude <= 13.5 && longitude >= 79.7);

  if (isCoastal) {
    return {
      code: 'ZONE-IV',
      name: 'Coastal Lowland & Estuary Sector',
      description: 'Zone IV High Vulnerability (Storm surge, gale winds & coastal inundation)',
      alertLevel: 'DEFCON 2 CRITICAL',
      color: 'text-red-400',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      baseRisk: 78,
    };
  }

  // River plains / catchment (Zone III - Flood & Flash River Overflow)
  const isRiverCatchment =
    dist.includes('thanjavur') || dist.includes('tiruchirappalli') || dist.includes('trichy') ||
    dist.includes('madurai') || dist.includes('villupuram') || dist.includes('kanchipuram') ||
    dist.includes('chengalpattu') || city.includes('tambaram') || city.includes('vandalur');

  if (isRiverCatchment) {
    return {
      code: 'ZONE-III',
      name: 'Inland River Catchment Sector',
      description: 'Zone III Elevated Alert (River basin runoff & arterial road chokepoints)',
      alertLevel: 'DEFCON 3 ELEVATED',
      color: 'text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      baseRisk: 58,
    };
  }

  // Western Ghats / Plateau (Zone II - Seismic / Landslide / Moderate)
  return {
    code: 'ZONE-II',
    name: 'Deccan Plateau Baseline Sector',
    description: 'Zone II Moderate Baseline (Geotechnically stable inland topography)',
    alertLevel: 'DEFCON 4 STABLE',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    baseRisk: 34,
  };
}

/**
 * Reverse geocodes coordinates to granular address details via OpenStreetMap Nominatim
 */
export async function reverseGeocodeCoordinates(latitude, longitude, accuracy = 15, fallbackHint = '') {
  let locationName = fallbackHint || `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  let specificArea = '';
  let city = '';
  let district = '';
  let state = '';
  let postcode = '';
  let road = '';
  let fullAddress = '';
  let addrObj = {};

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ResQAI-EmergencyOperationsCenter/1.0',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      addrObj = addr;
      fullAddress = data.display_name || '';

      specificArea =
        addr.neighbourhood ||
        addr.suburb ||
        addr.residential ||
        addr.quarter ||
        addr.subdistrict ||
        addr.locality ||
        addr.village ||
        addr.city_district ||
        '';
      city = (addr.city || addr.town || addr.municipality || '').replace(/\s+Corporation|\s+Taluk/gi, '');
      district = (addr.state_district || addr.county || '').replace(/\s+District/gi, '');
      state = addr.state || '';
      postcode = addr.postcode ? addr.postcode : '';
      road = addr.road || '';

      const parts = [];
      if (specificArea) parts.push(specificArea);
      if (city && city.toLowerCase() !== specificArea.toLowerCase()) {
        parts.push(city);
      } else if (district && district.toLowerCase() !== specificArea.toLowerCase()) {
        parts.push(district);
      }
      if (state && !parts.join(', ').includes(state)) {
        parts.push(state);
      }

      let builtName = parts.join(', ');
      if (postcode && builtName) {
        builtName += ` (${postcode})`;
      }

      locationName = builtName || fullAddress.split(',').slice(0, 3).join(', ') || locationName;
    }
  } catch (e) {
    console.warn('Reverse geocoding timed out, using fallback', e);
  }

  const zone = determineZone(latitude, longitude, addrObj);

  return {
    lat: Number(latitude.toFixed(5)),
    lng: Number(longitude.toFixed(5)),
    accuracy: Math.round(accuracy),
    name: locationName,
    specificArea,
    road,
    city,
    district,
    state,
    postcode,
    fullAddress,
    zone,
    isDetected: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Requests browser GPS location directly from hardware sensors.
 * Prompts user for location permission and resolves as soon as user clicks 'Allow'.
 */
export async function getUserCurrentLocation() {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser. Please use a modern browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          const isFineGps = accuracy < 2500;
          const loc = await reverseGeocodeCoordinates(latitude, longitude, accuracy);
          resolve({
            ...loc,
            isRealGps: isFineGps,
            isApproximateNetwork: !isFineGps,
            accuracy: Math.round(accuracy),
            accuracyRadius: Math.round(accuracy),
            isDetected: true,
          });
        } catch (err) {
          reject(err);
        }
      },
      (err) => {
        if (err.code === 1) { // PERMISSION_DENIED
          reject(new Error('Location permission was denied. Please click the site settings / lock icon in your browser address bar and set Location to "Allow".'));
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          reject(new Error('GPS location unavailable. Your device cannot acquire a location fix right now.'));
        } else if (err.code === 3) { // TIMEOUT
          reject(new Error('GPS location request timed out. Please click "Detect GPS" again to retry.'));
        } else {
          reject(new Error(err.message || 'Unable to access live GPS location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Searches locations in India using OpenStreetMap Nominatim with rich address details
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();

  // Check if input is coordinate format: "12.8681, 80.2166" or "12.8681 80.2166"
  const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
  const coordMatch = query.trim().match(coordPattern);

  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);

    // Validate coordinate ranges (India roughly: lat 8-35, lng 68-97)
    if (lat >= 6 && lat <= 38 && lng >= 65 && lng <= 100) {
      try {
        const geocoded = await reverseGeocodeCoordinates(lat, lng, 5, `Custom Location`);
        return [{
          id: `coord-${lat}-${lng}`,
          name: geocoded.name || `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          specificArea: geocoded.specificArea || 'Custom Coordinates',
          city: geocoded.city || '',
          district: geocoded.district || '',
          state: geocoded.state || 'Tamil Nadu',
          subtitle: `Custom Coordinates • ${geocoded.zone?.name || 'Manual Entry'}`,
          lat,
          lng,
          type: 'Custom Coordinates',
          zone: geocoded.zone,
        }];
      } catch (e) {
        // Fallback if reverse geocoding fails
        return [{
          id: `coord-${lat}-${lng}`,
          name: `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          specificArea: 'Custom Coordinates',
          city: '',
          district: '',
          state: 'Tamil Nadu',
          subtitle: 'Custom Coordinates • Manual Entry',
          lat,
          lng,
          type: 'Custom Coordinates',
        }];
      }
    }
  }

  // 1. Instant local matching for Tamil Nadu districts and key sectors
  const localHubs = [
    { name: 'Madurai City Center', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, type: 'District Headquarters' },
    { name: 'Goripalayam & Simmakkal', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9320, lng: 78.1380, type: 'Vaigai Riverfront Sector' },
    { name: 'Mattuthavani & Melur', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9550, lng: 78.1650, type: 'Expressway Hub' },
    { name: 'Thiruparankundram', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', lat: 9.8800, lng: 78.0700, type: 'South Madurai Basin' },
    { name: 'Chennai Central & Marina', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, type: 'State Capital Hub' },
    { name: 'Zone 15 Sholinganallur', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 12.8681, lng: 80.2166, type: 'OMR Tech Corridor' },
    { name: 'Zone 14 Velachery & Perungudi', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 12.9800, lng: 80.2200, type: 'Lowland Basin Sector' },
    { name: 'Guindy & Saidapet', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0070, lng: 80.2080, type: 'Mount Road Hub' },
    { name: 'Cuddalore Town Center & Port', city: 'Cuddalore', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.7550, lng: 79.7750, type: 'Coastal Port Sector' },
    { name: 'Cuddalore Old Town & Silver Beach', city: 'Cuddalore', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.7450, lng: 79.7900, type: 'Coastal Surge Sector' },
    { name: 'Chidambaram & Annamalai Nagar', city: 'Cuddalore', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.3992, lng: 79.6934, type: 'Vellar Basin Sector' },
    { name: 'Coimbatore Gandhipuram & RS Puram', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, type: 'District Headquarters' },
    { name: 'Tiruchirappalli (Trichy) Central', city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047, type: 'Cauvery River Hub' },
    { name: 'Salem Junction & Fairlands', city: 'Salem', district: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460, type: 'Plateau Transport Hub' },
    { name: 'Tirunelveli Junction & Palayamkottai', city: 'Tirunelveli', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lng: 77.7567, type: 'Thamirabarani Basin' },
    { name: 'Vellore Fort & Katpadi', city: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325, type: 'Palar River Basin' },
    { name: 'Villupuram Town Junction', city: 'Villupuram', district: 'Villupuram', state: 'Tamil Nadu', lat: 11.9401, lng: 79.4861, type: 'Central Transport Hub' },
  ];

  const matchedLocal = localHubs
    .filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q)
    )
    .map((h, i) => ({
      id: `local-tn-${i}-${h.city.toLowerCase()}`,
      name: `${h.name}, ${h.city}`,
      specificArea: h.name,
      city: h.city,
      district: h.district,
      state: h.state,
      subtitle: `${h.district} District, ${h.state} • ${h.type}`,
      lat: h.lat,
      lng: h.lng,
      type: h.type,
    }));

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&countrycodes=in&limit=6&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResQAI-EmergencyOperationsCenter/1.0',
      },
    });

    if (!res.ok) return matchedLocal;
    const data = await res.json();

    const remoteResults = data.map((item) => {
      const addr = item.address || {};
      const specificArea =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.subdistrict ||
        addr.locality ||
        '';
      const majorCity = (addr.city || addr.town || addr.village || addr.county || item.name || query).replace(/\s+Corporation/gi, '');
      const district = (addr.state_district || addr.county || '').replace(/\s+District/gi, '');
      const state = addr.state || '';
      const postcode = addr.postcode || '';

      const primaryName = specificArea && majorCity && specificArea !== majorCity
        ? `${specificArea}, ${majorCity}`
        : item.name || majorCity;

      const subtitle = [district, state, postcode].filter(Boolean).join(', ') || item.display_name;

      return {
        id: item.place_id,
        name: primaryName,
        specificArea: specificArea || primaryName,
        city: majorCity,
        district,
        state,
        postcode,
        country: addr.country || 'India',
        displayName: item.display_name,
        subtitle,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || item.class || 'Administrative',
      };
    });

    // Merge: local matches first, then deduplicated remote results
    const combined = [...matchedLocal];
    remoteResults.forEach((rem) => {
      const isDuplicate = combined.some(
        (c) => Math.abs(c.lat - rem.lat) < 0.05 && Math.abs(c.lng - rem.lng) < 0.05
      );
      if (!isDuplicate) combined.push(rem);
    });

    return combined.slice(0, 8);
  } catch (err) {
    console.error('Location search error:', err);
    return matchedLocal;
  }
}

/**
 * Synthesizes a FULL-FLEDGED emergency intelligence dossier for any location
 * Includes: Multi-hazard 4-pillar risk breakdown, hospital network (NO BEDS),
 * designated evacuation shelters, standby rescue squads, environmental telemetry,
 * terrain demographics, and tactical protocol.
 */
export function analyzeLocationRisk(
  lat,
  lng,
  locationName,
  disasters = [],
  monitoredAreas = [],
  hospitals = [],
  locationMetadata = {}
) {
  // 1. Sort all hospitals by distance (Strictly Proximity, ETA & Ambulances - NO BEDS)
  const sortedHospitals = hospitals
    .map((hosp) => {
      const dist = calculateDistanceKm(lat, lng, hosp.lat, hosp.lng);
      return {
        ...hosp,
        distanceKm: dist,
        transitEta: calculateTransitEta(dist),
      };
    })
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  const nearestHospital = sortedHospitals[0] || null;
  const backupHospitals = sortedHospitals.slice(1, 4);

  // 2. Find nearby active disasters within 50km
  const nearbyDisasters = disasters
    .map((d) => ({
      ...d,
      distanceKm: calculateDistanceKm(lat, lng, d.lat, d.lng),
    }))
    .filter((d) => d.distanceKm != null && d.distanceKm <= 50)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // 3. Find closest monitored sector
  let closestSector = null;
  let minSectorDist = Infinity;
  monitoredAreas.forEach((area) => {
    const dist = calculateDistanceKm(lat, lng, area.lat, area.lng);
    if (dist != null && dist < minSectorDist) {
      minSectorDist = dist;
      closestSector = { ...area, distanceKm: dist };
    }
  });

  // 4. Compute composite risk index (0 - 100%)
  let calculatedRisk = 30; // base ambient
  if (nearbyDisasters.length > 0) {
    const highestHazard = Math.max(...nearbyDisasters.map((d) => d.riskPercent || 60));
    calculatedRisk = Math.max(calculatedRisk, highestHazard);
  } else if (closestSector) {
    calculatedRisk = Math.min(85, Math.max(25, closestSector.riskPercent || 35));
  }

  // 5. 4-Pillar Vulnerability Assessment Breakdown
  const floodRisk = Math.min(
    95,
    Math.max(
      22,
      Math.round(
        calculatedRisk * 1.05 +
          (nearbyDisasters.some((d) => d.type?.toLowerCase().includes('flood')) ? 15 : 0)
      )
    )
  );

  const cycloneRisk = Math.min(
    92,
    Math.max(
      18,
      Math.round(
        calculatedRisk * 0.88 +
          (nearbyDisasters.some(
            (d) =>
              d.type?.toLowerCase().includes('cyclone') || d.type?.toLowerCase().includes('storm')
          )
            ? 20
            : 0)
      )
    )
  );

  const infrastructureRisk = Math.min(90, Math.max(25, Math.round(calculatedRisk * 0.92)));
  const seismicRisk = Math.min(
    45,
    Math.max(10, Math.round((closestSector?.riskPercent || 25) * 0.35))
  );

  let alertLevel = 'LOW';
  let badgeColor = 'emerald';
  if (calculatedRisk >= 70) {
    alertLevel = 'CRITICAL';
    badgeColor = 'red';
  } else if (calculatedRisk >= 50) {
    alertLevel = 'HIGH';
    badgeColor = 'orange';
  } else if (calculatedRisk >= 35) {
    alertLevel = 'MODERATE';
    badgeColor = 'yellow';
  }

  // 6. Evacuation Shelters & Relief Hubs tailored for this area
  const areaBase = (locationName || 'Sector').split(',')[0].trim();
  const shelters = [
    {
      id: 'sh-1',
      name: `${areaBase} Govt. Higher Secondary / Arts College`,
      type: 'Primary Relief & Inundation Shelter',
      distanceKm: 2.1,
      transitEta: '5 mins',
      capacity: '1,500 persons',
      status: 'Ready & Staged',
      facilities: ['Auxiliary Generator', 'Purified RO Water', 'Emergency Medical Post', 'Helipad Access'],
    },
    {
      id: 'sh-2',
      name: `${areaBase} District Sports Indoor Complex`,
      type: 'Mass Evacuation Hub',
      distanceKm: 4.3,
      transitEta: '9 mins',
      capacity: '3,000 persons',
      status: 'Open Standby',
      facilities: ['High-Volume Relief Kitchen', 'Sanitation Blocks', 'First Responder Equipment Depot'],
    },
    {
      id: 'sh-3',
      name: `${areaBase} Town Community Hall & Relief Center`,
      type: 'Local Sector Safe Haven',
      distanceKm: 1.6,
      transitEta: '4 mins',
      capacity: '750 persons',
      status: 'Staged',
      facilities: ['Satellite Comms Link', 'Blanket & Dry Ration Stocks', 'Inflatable Rafts Reserve'],
    },
  ];

  // 7. Tactical Response & Deployment Recommendations
  const deploymentAdvice = {
    recommendedSquads: calculatedRisk >= 70 ? 2 : 1,
    squadType:
      floodRisk > 60
        ? 'Water Rescue & Inflatable Boat Team (SDRF Special Wing)'
        : 'Multi-Hazard Quick Response Unit',
    equipment: [
      floodRisk > 50 ? '3x Motorized Inflatable Rescue Rafts' : '2x High-Clearance 4x4 Rescue Trucks',
      '4x Heavy-Duty Dewatering Submersible Pumps (500 LPM)',
      '12x Certified Swiftwater Rescue Technicians with Drysuits & Lifelines',
      '1x Mobile Satellite Telemetry & Mesh VHF Repeater',
    ],
    safeCorridor: 'Primary arterial route towards higher elevation / NH Bypass unobstructed.',
    cautionZone: 'Low-lying canal banks, bridge underpasses, and coastal feeder roads prone to rapid inundation.',
  };

  // 8. Geography & Demographics Estimation
  const terrainType =
    lat < 12.0 && lng > 79.5
      ? 'Coastal Floodplain & Estuary Lowlands (High Storm Surge Susceptibility)'
      : lat > 12.8 && lng > 80.0
        ? 'Metropolitan Coastal Basin (Urban Drainage Runoff & Waterlogging Prone)'
        : 'Inland River Basin & Alluvial Plain (Flash Flood & Drainage Runoff Exposure)';

  const populationEstimate = Math.floor(85000 + Math.abs(Math.sin(lat * 10)) * 145000);

  return {
    locationName,
    lat: Number(lat.toFixed(5)),
    lng: Number(lng.toFixed(5)),
    calculatedRisk,
    alertLevel,
    badgeColor,
    terrainType,
    populationEstimate: populationEstimate.toLocaleString(),
    vulnerabilityZone:
      calculatedRisk >= 70 ? 'Zone IV - High Vulnerability' : 'Zone III - Moderate Vulnerability',
    riskBreakdown: {
      flood: floodRisk,
      cyclone: cycloneRisk,
      infrastructure: infrastructureRisk,
      seismic: seismicRisk,
    },
    nearestHospital,
    backupHospitals,
    hospitalsInReach: sortedHospitals.slice(0, 8),
    nearbyDisasters,
    closestSector,
    shelters,
    deploymentAdvice,
    environmentalTelemetry: {
      rainfall: (120 + Math.round((calculatedRisk / 100) * 60)).toFixed(1) + ' mm/h',
      waterLevel: (3.2 + (calculatedRisk / 100) * 2.2).toFixed(1) + ' m',
      windSpeed: 45 + Math.round((cycloneRisk / 100) * 45) + ' km/h',
      seismic: '1.6 Richter (Stable)',
    },
    weather: generateFallbackWeather(lat, lng, locationName),
    metadata: locationMetadata,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 4-DIRECTIONAL ADJACENT ZONES ENGINE (NORTH, SOUTH, EAST, WEST) ────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Granular Registry of Sectors & Zones across Tamil Nadu
 */
export const TAMIL_NADU_SECTOR_REGISTRY = [
  // ── Chennai South & OMR Corridor ──
  {
    name: 'Zone 15 Sholinganallur',
    locality: 'OMR Tech Corridor / Junction',
    lat: 12.8681,
    lng: 80.2166,
    zoneCode: 'ZONE-IV',
    hazard: 'Coastal Lowland & Estuary Sector',
    riskPercent: 78,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'North via OMR Expressway to Guindy Flyover / Inland NH-45',
  },
  {
    name: 'Zone 14 Perungudi & Thoraipakkam',
    locality: 'OMR Express Arterial',
    lat: 12.9560,
    lng: 80.2420,
    zoneCode: 'ZONE-IV',
    hazard: 'Tidal Canal Inundation Sector',
    riskPercent: 72,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'West via 200 Feet Radial Road to GST Highway',
  },
  {
    name: 'Injambakkam & Akkarai Coastal Belt',
    locality: 'East Coast Road (ECR)',
    lat: 12.8900,
    lng: 80.2500,
    zoneCode: 'ZONE-IV',
    hazard: 'High-Tide Sea Surge & Gale Belt',
    riskPercent: 84,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'Move inland across link road to Rajiv Gandhi Salai (OMR)',
  },
  {
    name: 'Uthandi & Panaiyur Coastal Shore',
    locality: 'ECR South Coast',
    lat: 12.8450,
    lng: 80.2480,
    zoneCode: 'ZONE-IV',
    hazard: 'Maritime Surge & Beach Inundation',
    riskPercent: 80,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'West via Panaiyur Link to Navalur / Siruseri higher ground',
  },
  {
    name: 'Siruseri IT Corridor & SIPCOT',
    locality: 'OMR Southern Terminal',
    lat: 12.8250,
    lng: 80.2190,
    zoneCode: 'ZONE-IV',
    hazard: 'Runoff Basin & Lowland IT Park',
    riskPercent: 58,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'West via Vandalur-Kelambakkam Expressway to GST Road',
  },
  {
    name: 'Navalur & Semmancheri',
    locality: 'OMR Mid-Corridor',
    lat: 12.8480,
    lng: 80.2250,
    zoneCode: 'ZONE-IV',
    hazard: 'Estuary Catchment & Drainage Runoff',
    riskPercent: 62,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'North via OMR elevated corridor towards Sholinganallur',
  },
  {
    name: 'Kelambakkam & Kovalam Backwaters',
    locality: 'Kovalam Estuary Confluence',
    lat: 12.7900,
    lng: 80.2220,
    zoneCode: 'ZONE-IV',
    hazard: 'Coastal Backwater Overflow',
    riskPercent: 68,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'West via Kelambakkam-Vandalur Road to Chengalpattu NH',
  },
  {
    name: 'Thiruporur & Mahabalipuram Hinterland',
    locality: 'Old Mahabalipuram South',
    lat: 12.6500,
    lng: 80.1900,
    zoneCode: 'ZONE-III',
    hazard: 'River Basin & Coastal Plain',
    riskPercent: 52,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'Inland bypass via Thirukazhukundram to Chengalpattu',
  },
  {
    name: 'Medavakkam & Pallikaranai Marsh',
    locality: 'Pallikaranai Wetland Basin',
    lat: 12.9180,
    lng: 80.1880,
    zoneCode: 'ZONE-III',
    hazard: 'Marshland Catchment & Surcharge',
    riskPercent: 66,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'West via Velachery-Tambaram Main Road to Tambaram Bypass',
  },
  {
    name: 'Sithalapakkam & Ottiyambakkam',
    locality: 'Nanmangalam Forest Perimeter',
    lat: 12.8750,
    lng: 80.1750,
    zoneCode: 'ZONE-III',
    hazard: 'Lake Surplus Channel & Runoff',
    riskPercent: 55,
    alertLevel: 'MODERATE',
    evacuationRoute: 'West towards Medavakkam / Tambaram East',
  },
  {
    name: 'Tambaram & Sanatorium Zone',
    locality: 'Grand Southern Trunk (GST) Road',
    lat: 12.9250,
    lng: 80.1400,
    zoneCode: 'ZONE-III',
    hazard: 'Urban Rail & Highway Chokepoint',
    riskPercent: 54,
    alertLevel: 'MODERATE',
    evacuationRoute: 'Chennai Outer Ring Road (ORR) elevated bypass',
  },
  {
    name: 'Vandalur & Guduvanchery Sector',
    locality: 'NH-45 Southern Gateway',
    lat: 12.8780,
    lng: 80.0820,
    zoneCode: 'ZONE-III',
    hazard: 'Hillside Drainage Runoff & NH Arterial',
    riskPercent: 48,
    alertLevel: 'MODERATE',
    evacuationRoute: 'NH-45 south towards Maraimalai Nagar / Chengalpattu',
  },
  {
    name: 'Chengalpattu Operations Sector',
    locality: 'Palar River Basin',
    lat: 12.6845,
    lng: 79.9832,
    zoneCode: 'ZONE-III',
    hazard: 'River Valley Runoff & Floodplain',
    riskPercent: 52,
    alertLevel: 'MODERATE',
    evacuationRoute: 'NH-45 flyovers towards Kanchipuram high ground',
  },

  // ── Chennai Central & North Sectors ──
  {
    name: 'Velachery & Adyar Basin',
    locality: 'Adyar River Catchment',
    lat: 12.9800,
    lng: 80.2200,
    zoneCode: 'ZONE-IV',
    hazard: 'River Embankment Lowland',
    riskPercent: 75,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'North-West via Inner Ring Road to Kathipara Junction',
  },
  {
    name: 'Guindy & Saidapet Sector',
    locality: 'Mount Road / Kathipara Hub',
    lat: 13.0070,
    lng: 80.2080,
    zoneCode: 'ZONE-III',
    hazard: 'Adyar River Causeway Inundation',
    riskPercent: 50,
    alertLevel: 'MODERATE',
    evacuationRoute: 'Anna Salai / GST Road elevated flyover network',
  },
  {
    name: 'Zone 9 Mylapore & Alwarpet',
    locality: 'Central Coastal Heritage',
    lat: 13.0360,
    lng: 80.2530,
    zoneCode: 'ZONE-IV',
    hazard: 'Buckingham Canal Surcharge',
    riskPercent: 65,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'Inland via Cathedral Road to Mount Road',
  },
  {
    name: 'Zone 5 Royapuram & Port Area',
    locality: 'North Chennai Harbor Belt',
    lat: 13.1100,
    lng: 80.2900,
    zoneCode: 'ZONE-IV',
    hazard: 'Port Coastal Surge & Gale Winds',
    riskPercent: 82,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'West via GNT Road / Inner Ring Road to higher ground',
  },

  // ── Cuddalore District Sectors ──
  {
    name: 'Cuddalore Town Center & Port',
    locality: 'Uppanar River & Bay of Bengal Coast',
    lat: 11.7550,
    lng: 79.7750,
    zoneCode: 'ZONE-IV',
    hazard: 'Coastal Surge & River Estuary Inundation',
    riskPercent: 76,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'West via Cuddalore-Vridhachalam Road / NH-45A Bypass',
  },
  {
    name: 'Cuddalore Old Town & Devanampattinam',
    locality: 'Silver Beach Coastal Sector',
    lat: 11.7450,
    lng: 79.7900,
    zoneCode: 'ZONE-IV',
    hazard: 'Maritime Storm Surge & Beach Erosion',
    riskPercent: 85,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'Move inland from coastal strip to Cuddalore New Town',
  },
  {
    name: 'Nellikuppam & Semmandalam',
    locality: 'Northern Cuddalore Agro-Industrial',
    lat: 11.7850,
    lng: 79.6850,
    zoneCode: 'ZONE-III',
    hazard: 'Thenpennai River Plain Runoff',
    riskPercent: 56,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'North-West via Panruti State Highway',
  },
  {
    name: 'Panruti Agricultural Sector',
    locality: 'Thenpennai River Alluvial Basin',
    lat: 11.7750,
    lng: 79.5520,
    zoneCode: 'ZONE-III',
    hazard: 'Flash River Basin Overflow',
    riskPercent: 42,
    alertLevel: 'MODERATE',
    evacuationRoute: 'West via Kumbakonam Main Road',
  },
  {
    name: 'Kurinjipadi & Vadalur Basin',
    locality: 'Perumal Lake & Agro Belt',
    lat: 11.6190,
    lng: 79.6410,
    zoneCode: 'ZONE-III',
    hazard: 'Lake Surplus Channel Overflow',
    riskPercent: 48,
    alertLevel: 'MODERATE',
    evacuationRoute: 'North-West towards Neyveli Township',
  },
  {
    name: 'Chidambaram & Bhuvanagiri',
    locality: 'Vellar River Delta Plain',
    lat: 11.4150,
    lng: 79.7050,
    zoneCode: 'ZONE-IV',
    hazard: 'Vellar & Kollidam River Surcharge',
    riskPercent: 58,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'North-West via Chidambaram-Sirkazhi NH to higher elevation',
  },
  {
    name: 'Parangipettai & Pichavaram Mangroves',
    locality: 'Vellar Estuary & Mangrove Lagoon',
    lat: 11.4980,
    lng: 79.7650,
    zoneCode: 'ZONE-IV',
    hazard: 'Mangrove Tidal Swell & Coastal Surge',
    riskPercent: 80,
    alertLevel: 'CRITICAL',
    evacuationRoute: 'West inland towards Bhuvanagiri / Chidambaram',
  },
  {
    name: 'Virudhachalam Junction Sector',
    locality: 'Manimuktha River Inland Basin',
    lat: 11.5230,
    lng: 79.3220,
    zoneCode: 'ZONE-II',
    hazard: 'Inland River Catchment',
    riskPercent: 28,
    alertLevel: 'STABLE',
    evacuationRoute: 'NH bypass towards Salem-Cuddalore Highway',
  },

  // ── Coimbatore Sectors ──
  {
    name: 'Saravanampatti & Thudiyalur',
    locality: 'North Coimbatore Tech Corridor',
    lat: 11.0800,
    lng: 76.9900,
    zoneCode: 'ZONE-II',
    hazard: 'Foothill Runoff Drainage',
    riskPercent: 30,
    alertLevel: 'STABLE',
    evacuationRoute: 'South-East via Sathy Road to Avinashi Highway',
  },
  {
    name: 'Peelamedu & Singanallur',
    locality: 'East Coimbatore Industrial Hub',
    lat: 11.0280,
    lng: 77.0250,
    zoneCode: 'ZONE-II',
    hazard: 'Urban Canal Runoff',
    riskPercent: 32,
    alertLevel: 'STABLE',
    evacuationRoute: 'Avinashi Road elevated bypass',
  },
  {
    name: 'Gandhipuram & RS Puram',
    locality: 'Coimbatore City Core',
    lat: 11.0168,
    lng: 76.9558,
    zoneCode: 'ZONE-II',
    hazard: 'Noyyal River Catchment Baseline',
    riskPercent: 28,
    alertLevel: 'STABLE',
    evacuationRoute: 'West via Perur Bypass towards Western Ghats foothills',
  },
  {
    name: 'Pollachi Sector',
    locality: 'South Coimbatore Agro Foothills',
    lat: 10.6600,
    lng: 77.0100,
    zoneCode: 'ZONE-II',
    hazard: 'Aliyar Dam Catchment Runoff',
    riskPercent: 35,
    alertLevel: 'STABLE',
    evacuationRoute: 'Pollachi-Coimbatore 4-lane highway',
  },

  // ── Madurai Sectors ──
  {
    name: 'Goripalayam & Simmakkal',
    locality: 'Central Madurai Vaigai Riverfront',
    lat: 9.9320,
    lng: 78.1380,
    zoneCode: 'ZONE-III',
    hazard: 'Vaigai River Surplus Basin',
    riskPercent: 48,
    alertLevel: 'MODERATE',
    evacuationRoute: 'North via Dindigul Highway away from river causeways',
  },
  {
    name: 'Mattuthavani & Melur Sector',
    locality: 'North-East Madurai Expressway Hub',
    lat: 9.9550,
    lng: 78.1650,
    zoneCode: 'ZONE-II',
    hazard: 'Highway Runoff Chokepoint',
    riskPercent: 36,
    alertLevel: 'STABLE',
    evacuationRoute: 'Madurai Ring Road to Trichy NH',
  },
  {
    name: 'Thiruparankundram & Pasumalai',
    locality: 'South Madurai Hillock Basin',
    lat: 9.8800,
    lng: 78.0700,
    zoneCode: 'ZONE-II',
    hazard: 'Hillside Inundation Chokepoints',
    riskPercent: 38,
    alertLevel: 'STABLE',
    evacuationRoute: 'NH-7 south towards Virudhunagar bypass',
  },

  // ── Trichy Sectors ──
  {
    name: 'Srirangam & Cauvery Island',
    locality: 'Cauvery & Kollidam River Confluence',
    lat: 10.8650,
    lng: 78.6900,
    zoneCode: 'ZONE-IV',
    hazard: 'Cauvery River Floodplain & Island Sector',
    riskPercent: 68,
    alertLevel: 'ELEVATED',
    evacuationRoute: 'South via Cauvery Bridges to Trichy Mainland high ground',
  },
  {
    name: 'Cantonment & Central Trichy',
    locality: 'Collectorate & District Administration',
    lat: 10.8050,
    lng: 78.6850,
    zoneCode: 'ZONE-III',
    hazard: 'Koraiyar River Overflow Basin',
    riskPercent: 44,
    alertLevel: 'MODERATE',
    evacuationRoute: 'NH-45 South towards Viralimalai',
  },
];

/**
 * Calculates 4-Directional Adjacent Zones (North, South, East, West)
 * from any active GPS coordinates or manually searched location.
 */
export function getFourDirectionalAdjacentZones(originLat, originLng, originName = '') {
  const lat = Number(originLat) || 12.8681;
  const lng = Number(originLng) || 80.2166;

  // Compute bearing and distance to every candidate in registry
  const candidates = TAMIL_NADU_SECTOR_REGISTRY.map((sec) => {
    const dist = calculateDistanceKm(lat, lng, sec.lat, sec.lng);
    const dLat = ((sec.lat - lat) * Math.PI) / 180;
    const dLng = ((sec.lng - lng) * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos((sec.lat * Math.PI) / 180);
    const x =
      Math.cos((lat * Math.PI) / 180) * Math.sin((sec.lat * Math.PI) / 180) -
      Math.sin((lat * Math.PI) / 180) * Math.cos((sec.lat * Math.PI) / 180) * Math.cos(dLng);
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

    return {
      ...sec,
      distanceKm: dist,
      bearing: Math.round(bearing),
      transitEta: calculateTransitEta(dist),
    };
  }).filter((c) => c.distanceKm != null && c.distanceKm >= 0.8); // Exclude current zone itself

  // Categorize into 4 quadrants
  // North: 315° to 45°
  const northCandidates = candidates
    .filter((c) => c.bearing >= 315 || c.bearing < 45)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // East: 45° to 135°
  const eastCandidates = candidates
    .filter((c) => c.bearing >= 45 && c.bearing < 135)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // South: 135° to 225°
  const southCandidates = candidates
    .filter((c) => c.bearing >= 135 && c.bearing < 225)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // West: 225° to 315°
  const westCandidates = candidates
    .filter((c) => c.bearing >= 225 && c.bearing < 315)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Helper to format a zone result or synthesize a geographic fallback
  const formatDirectionZone = (direction, candidate, defaultDeg, latOffset, lngOffset) => {
    if (candidate && candidate.distanceKm <= 40) {
      return {
        direction,
        cardinal: direction.charAt(0),
        bearingText: `${candidate.bearing}° ${direction.charAt(0)}`,
        name: candidate.name,
        locality: candidate.locality,
        zoneCode: candidate.zoneCode || 'ZONE-III',
        hazard: candidate.hazard,
        riskPercent: candidate.riskPercent || 50,
        alertLevel: candidate.alertLevel || 'ELEVATED',
        distanceKm: candidate.distanceKm,
        transitEta: candidate.transitEta,
        evacuationRoute: candidate.evacuationRoute,
        lat: candidate.lat,
        lng: candidate.lng,
        isSynthetic: false,
      };
    }

    // Geographic synthetic fallback if no sector within 40km
    const targetLat = lat + latOffset;
    const targetLng = lng + lngOffset;
    const dist = calculateDistanceKm(lat, lng, targetLat, targetLng);
    const isCoast = targetLng >= 80.15 || (targetLat >= 11.4 && targetLat <= 13.5 && targetLng >= 79.7);
    const zoneCode = isCoast ? 'ZONE-IV' : 'ZONE-III';

    let synthName = '';
    let synthHazard = '';
    let synthEvac = '';

    if (direction === 'NORTH') {
      synthName = `Northern Sector (Lat: ${targetLat.toFixed(3)})`;
      synthHazard = 'Upstream Catchment & Arterial Corridor';
      synthEvac = `Northward arterial transport corridor to higher elevation`;
    } else if (direction === 'SOUTH') {
      synthName = `Southern Sector (Lat: ${targetLat.toFixed(3)})`;
      synthHazard = 'Downstream Basin & Drainage Basin';
      synthEvac = `South-bound bypass road away from low-lying culverts`;
    } else if (direction === 'EAST') {
      synthName = isCoast ? `Coastal Seaboard Belt (Lng: ${targetLng.toFixed(3)})` : `Eastern Agricultural Sector`;
      synthHazard = isCoast ? 'Maritime High-Tide Surge & Estuary Surcharge' : 'Eastern Canal Runoff';
      synthEvac = isCoast ? `Immediate westward movement away from shore line` : `East arterial link corridor`;
    } else {
      synthName = `Western Inland Sector (Lng: ${targetLng.toFixed(3)})`;
      synthHazard = 'Inland Drainage Runoff & Wetland Basin';
      synthEvac = `Western bypass elevated highway`;
    }

    return {
      direction,
      cardinal: direction.charAt(0),
      bearingText: `${defaultDeg}° ${direction.charAt(0)}`,
      name: synthName,
      locality: `Adjacent Perimeter (${dist} km)`,
      zoneCode,
      hazard: synthHazard,
      riskPercent: isCoast ? 74 : 48,
      alertLevel: isCoast ? 'CRITICAL' : 'MODERATE',
      distanceKm: dist,
      transitEta: calculateTransitEta(dist),
      evacuationRoute: synthEvac,
      lat: Number(targetLat.toFixed(5)),
      lng: Number(targetLng.toFixed(5)),
      isSynthetic: true,
    };
  };

  return {
    origin: {
      lat,
      lng,
      name: originName || `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    },
    north: formatDirectionZone('NORTH', northCandidates[0], 360, 0.065, 0.005),
    south: formatDirectionZone('SOUTH', southCandidates[0], 180, -0.065, -0.005),
    east: formatDirectionZone('EAST', eastCandidates[0], 90, 0.005, 0.065),
    west: formatDirectionZone('WEST', westCandidates[0], 270, -0.005, -0.065),
  };
}

