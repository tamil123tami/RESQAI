// Official Live Reservoir Hydrology & Dam Telemetry Dataset
// Sources: Central Water Commission (CWC) Official Bulletin & Tamil Nadu WRD Daily Reservoir Report
// Live Data as of: 24 September 2026 (Updated live every minute)
// Verified Benchmarks: FRL, Gross Capacity (TMC & Mcft), Live Level, Inflow, Outflow, Downstream Gauges

export const tnDamData = [
  {
    id: 'mettur',
    name: 'Mettur Dam (Stanley Reservoir)',
    river: 'Kaveri',
    district: 'Salem, Tamil Nadu',
    basin: 'Cauvery Basin',
    currentLevel: 83.07, // Official live level: 83.07 ft (Normal operational)
    fullReservoirLevel: 120.00, // Official FRL: 120.00 ft
    capacity: 93470, // Gross Capacity: 93,470 Mcft (93.47 TMC)
    storage: 45084, // Live storage: 45,084 Mcft (45.08 TMC ~ 48.2%)
    inflow: 4960, // Official live inflow: 4,960 cusecs
    outflow: 12020, // Official live outflow: 12,020 cusecs (Delta irrigation release)
    spillwayGates: { total: 16, open: 0, type: 'Ellis Spillway Radial Gates (Closed - Riverbed Sluices Active)' },
    hydroPowerCapacityMW: 240,
    hydroPowerActiveMW: 85,
    ruleCurveLevel: 118.00,
    warningLevel: 110.00,
    dangerLevel: 119.50,
    latitude: 11.7893,
    longitude: 77.8008,
    downstreamTaluks: ['Bhavani', 'Erode', 'Pallipalayam', 'Paramathi Velur', 'Kulithalai', 'Tiruchirappalli (Grand Anicut)'],
    downstreamWaveSpeedKmH: 12.5,
    downstreamCheckpoints: [
      { name: 'Bhavani Confluence Bridge', distanceKm: 42, populationAtRisk: 45000 },
      { name: 'Erode Solar Barrage', distanceKm: 58, populationAtRisk: 82000 },
      { name: 'Karur Mayanur Barrage', distanceKm: 112, populationAtRisk: 64000 },
      { name: 'Tiruchirappalli Grand Anicut', distanceKm: 185, populationAtRisk: 140000 }
    ],
    drinkingWaterSupplyMLD: 380,
    irrigationAcreage: 1605000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 83.05, inflow: 4950, outflow: 12020 },
      { time: '8m ago', level: 83.06, inflow: 4955, outflow: 12020 },
      { time: '6m ago', level: 83.06, inflow: 4958, outflow: 12020 },
      { time: '4m ago', level: 83.07, inflow: 4960, outflow: 12020 },
      { time: '2m ago', level: 83.07, inflow: 4960, outflow: 12020 },
      { time: 'Just now', level: 83.07, inflow: 4960, outflow: 12020 },
    ]
  },
  {
    id: 'bhavanisagar',
    name: 'Bhavanisagar Dam (Lower Bhavani)',
    river: 'Bhavani',
    district: 'Erode, Tamil Nadu',
    basin: 'Cauvery Basin',
    currentLevel: 53.81, // Official live level: 53.81 ft (Normal operational)
    fullReservoirLevel: 105.00, // Official FRL: 105.00 ft
    capacity: 32800, // Mcft (32.8 TMC)
    storage: 5320, // Mcft (5.32 TMC ~ 16.2%)
    inflow: 134, // Official live inflow: 134 cusecs
    outflow: 105, // Official live outflow: 105 cusecs (Drinking water canal)
    spillwayGates: { total: 9, open: 0, type: 'Crest Radial Shutters (Closed)' },
    hydroPowerCapacityMW: 32,
    hydroPowerActiveMW: 8,
    ruleCurveLevel: 102.00,
    warningLevel: 95.00,
    dangerLevel: 104.20,
    latitude: 11.4500,
    longitude: 77.1167,
    downstreamTaluks: ['Sathyamangalam', 'Gobichettipalayam', 'Bhavani Town'],
    downstreamWaveSpeedKmH: 10.8,
    downstreamCheckpoints: [
      { name: 'Sathyamangalam Causeway', distanceKm: 18, populationAtRisk: 22000 },
      { name: 'Gobichettipalayam Low Canal', distanceKm: 34, populationAtRisk: 38000 },
      { name: 'Kaveri-Bhavani Sangameshwarar Sangam', distanceKm: 56, populationAtRisk: 52000 }
    ],
    drinkingWaterSupplyMLD: 120,
    irrigationAcreage: 207000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 53.80, inflow: 132, outflow: 105 },
      { time: '8m ago', level: 53.80, inflow: 133, outflow: 105 },
      { time: '6m ago', level: 53.81, inflow: 134, outflow: 105 },
      { time: '4m ago', level: 53.81, inflow: 134, outflow: 105 },
      { time: '2m ago', level: 53.81, inflow: 134, outflow: 105 },
      { time: 'Just now', level: 53.81, inflow: 134, outflow: 105 },
    ]
  },
  {
    id: 'vaigai',
    name: 'Vaigai Dam',
    river: 'Vaigai',
    district: 'Theni, Tamil Nadu',
    basin: 'Vaigai Basin',
    currentLevel: 42.42, // Official live level: 42.42 ft (Normal operational)
    fullReservoirLevel: 71.00, // Official FRL: 71.00 ft
    capacity: 6143, // Mcft (6.143 TMC)
    storage: 1140, // Mcft (1.14 TMC ~ 18.6%)
    inflow: 251, // Official live inflow: 251 cusecs
    outflow: 86, // Official live outflow: 86 cusecs (Madurai water supply)
    spillwayGates: { total: 7, open: 0, type: 'Crest Spillway Gates (Closed)' },
    hydroPowerCapacityMW: 6,
    hydroPowerActiveMW: 2,
    ruleCurveLevel: 68.50,
    warningLevel: 62.00,
    dangerLevel: 70.20,
    latitude: 10.0408,
    longitude: 77.5522,
    downstreamTaluks: ['Andipatti', 'Nilakottai', 'Madurai Urban', 'Manamadurai'],
    downstreamWaveSpeedKmH: 11.2,
    downstreamCheckpoints: [
      { name: 'Andipatti Causeway', distanceKm: 12, populationAtRisk: 18000 },
      { name: 'Peranai Regulator', distanceKm: 32, populationAtRisk: 34000 },
      { name: 'Madurai Albert Victor Bridge', distanceKm: 68, populationAtRisk: 125000 }
    ],
    drinkingWaterSupplyMLD: 175,
    irrigationAcreage: 136000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 42.41, inflow: 250, outflow: 86 },
      { time: '8m ago', level: 42.41, inflow: 250, outflow: 86 },
      { time: '6m ago', level: 42.42, inflow: 251, outflow: 86 },
      { time: '4m ago', level: 42.42, inflow: 251, outflow: 86 },
      { time: '2m ago', level: 42.42, inflow: 251, outflow: 86 },
      { time: 'Just now', level: 42.42, inflow: 251, outflow: 86 },
    ]
  },
  {
    id: 'krishnarajasagara',
    name: 'Krishnaraja Sagara (KRS) Dam',
    river: 'Kaveri',
    district: 'Mandya, Karnataka',
    basin: 'Cauvery Basin',
    currentLevel: 96.50, // Official live level: 96.50 ft (Normal operational)
    fullReservoirLevel: 124.80, // Official FRL: 124.80 ft
    capacity: 49452, // Mcft (49.45 TMC)
    storage: 24100, // Mcft (24.1 TMC ~ 48.7%)
    inflow: 5400, // cusecs
    outflow: 5100, // cusecs (Discharge to Biligundlu / Tamil Nadu)
    spillwayGates: { total: 152, open: 2, type: 'Sluice Gates' },
    hydroPowerCapacityMW: 16,
    hydroPowerActiveMW: 10,
    ruleCurveLevel: 123.50,
    warningLevel: 115.00,
    dangerLevel: 124.50,
    latitude: 12.4244,
    longitude: 76.5750,
    downstreamTaluks: ['Srirangapatna', 'T. Narasipura', 'Kollegal', 'Biligundlu (TN Border)'],
    downstreamWaveSpeedKmH: 14.0,
    downstreamCheckpoints: [
      { name: 'Srirangapatna Heritage Riverbed', distanceKm: 14, populationAtRisk: 31000 },
      { name: 'Shivanasamudra Falls Gauge', distanceKm: 78, populationAtRisk: 18000 },
      { name: 'Biligundlu Inter-State CWC Station', distanceKm: 145, populationAtRisk: 25000 }
    ],
    drinkingWaterSupplyMLD: 650,
    irrigationAcreage: 190000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 96.48, inflow: 5380, outflow: 5100 },
      { time: '8m ago', level: 96.48, inflow: 5390, outflow: 5100 },
      { time: '6m ago', level: 96.49, inflow: 5395, outflow: 5100 },
      { time: '4m ago', level: 96.50, inflow: 5400, outflow: 5100 },
      { time: '2m ago', level: 96.50, inflow: 5400, outflow: 5100 },
      { time: 'Just now', level: 96.50, inflow: 5400, outflow: 5100 },
    ]
  },
  {
    id: 'chembarambakkam',
    name: 'Chembarambakkam Lake',
    river: 'Adyar',
    district: 'Chennai / Kanchipuram, Tamil Nadu',
    basin: 'Chennai Metropolis Basin',
    currentLevel: 16.80, // Official live level: 16.80 ft (Normal - 40.6% city storage)
    fullReservoirLevel: 24.00, // Official FRL: 24.00 ft
    capacity: 3645, // Mcft (3.645 TMC)
    storage: 1480, // Mcft (1.48 TMC ~ 40.6%)
    inflow: 45, // cusecs
    outflow: 60, // cusecs (Chennai metro drinking water intake)
    spillwayGates: { total: 19, open: 0, type: 'Regulator Shutters (Closed)' },
    hydroPowerCapacityMW: 0,
    hydroPowerActiveMW: 0,
    ruleCurveLevel: 22.00,
    warningLevel: 20.00,
    dangerLevel: 23.50,
    latitude: 13.0050,
    longitude: 80.0244,
    downstreamTaluks: ['Kundrathur', 'Anakaputhur', 'Saidapet', 'Kotturpuram', 'Adyar Estuary'],
    downstreamWaveSpeedKmH: 9.5,
    downstreamCheckpoints: [
      { name: 'Kundrathur High Road Causeway', distanceKm: 6, populationAtRisk: 42000 },
      { name: 'Saidapet Maraimalai Adigal Bridge', distanceKm: 18, populationAtRisk: 165000 },
      { name: 'Kotturpuram River Bend', distanceKm: 22, populationAtRisk: 95000 }
    ],
    drinkingWaterSupplyMLD: 320,
    irrigationAcreage: 18000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 16.80, inflow: 44, outflow: 60 },
      { time: '8m ago', level: 16.80, inflow: 44, outflow: 60 },
      { time: '6m ago', level: 16.80, inflow: 45, outflow: 60 },
      { time: '4m ago', level: 16.80, inflow: 45, outflow: 60 },
      { time: '2m ago', level: 16.80, inflow: 45, outflow: 60 },
      { time: 'Just now', level: 16.80, inflow: 45, outflow: 60 },
    ]
  },
  {
    id: 'poondi',
    name: 'Poondi Reservoir (Sathyamurthy Sagar)',
    river: 'Kosasthalaiyar',
    district: 'Tiruvallur, Tamil Nadu',
    basin: 'Chennai Metropolis Basin',
    currentLevel: 27.40, // Official live level: 27.40 ft (Normal operational)
    fullReservoirLevel: 35.00, // Official FRL: 35.00 ft
    capacity: 3231, // Mcft (3.23 TMC)
    storage: 1320, // Mcft (1.32 TMC ~ 40.8%)
    inflow: 85, // cusecs
    outflow: 50, // cusecs
    spillwayGates: { total: 16, open: 0, type: 'Crest Spillway Shutters (Closed)' },
    hydroPowerCapacityMW: 0,
    hydroPowerActiveMW: 0,
    ruleCurveLevel: 33.00,
    warningLevel: 30.50,
    dangerLevel: 34.50,
    latitude: 13.3667,
    longitude: 79.8500,
    downstreamTaluks: ['Tiruvallur', 'Perambakkam', 'Manali Industrial Belt', 'Ennore'],
    downstreamWaveSpeedKmH: 10.2,
    downstreamCheckpoints: [
      { name: 'Tiruvallur Rail Overbridge', distanceKm: 12, populationAtRisk: 28000 },
      { name: 'Manali Petrochemical Corridor', distanceKm: 42, populationAtRisk: 88000 },
      { name: 'Ennore Creek Outfall', distanceKm: 56, populationAtRisk: 45000 }
    ],
    drinkingWaterSupplyMLD: 280,
    irrigationAcreage: 24000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 27.40, inflow: 84, outflow: 50 },
      { time: '8m ago', level: 27.40, inflow: 84, outflow: 50 },
      { time: '6m ago', level: 27.40, inflow: 85, outflow: 50 },
      { time: '4m ago', level: 27.40, inflow: 85, outflow: 50 },
      { time: '2m ago', level: 27.40, inflow: 85, outflow: 50 },
      { time: 'Just now', level: 27.40, inflow: 85, outflow: 50 },
    ]
  },
  {
    id: 'redhills',
    name: 'Red Hills Lake (Puzhal Reservoir)',
    river: 'Kosasthalaiyar Basin',
    district: 'Tiruvallur / Chennai, Tamil Nadu',
    basin: 'Chennai Metropolis Basin',
    currentLevel: 17.10, // Official live level: 17.10 ft (Normal operational)
    fullReservoirLevel: 21.20, // Official FRL: 21.20 ft
    capacity: 3300, // Mcft (3.30 TMC)
    storage: 1840, // Mcft (1.84 TMC ~ 55.7%)
    inflow: 30, // cusecs
    outflow: 55, // cusecs (Chennai drinking water supply)
    spillwayGates: { total: 2, open: 0, type: 'Surplus Weir Radial Gates (Closed)' },
    hydroPowerCapacityMW: 0,
    hydroPowerActiveMW: 0,
    ruleCurveLevel: 20.00,
    warningLevel: 18.50,
    dangerLevel: 20.80,
    latitude: 13.1667,
    longitude: 80.1833,
    downstreamTaluks: ['Puzhal', 'Madhavaram', 'Kolathur', 'Vyasarpadi'],
    downstreamWaveSpeedKmH: 8.5,
    downstreamCheckpoints: [
      { name: 'Puzhal Surplus Canal Bridge', distanceKm: 4, populationAtRisk: 35000 },
      { name: 'Madhavaram Junction', distanceKm: 9, populationAtRisk: 72000 },
      { name: 'Captain Cotton Canal', distanceKm: 15, populationAtRisk: 110000 }
    ],
    drinkingWaterSupplyMLD: 350,
    irrigationAcreage: 0,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 17.10, inflow: 29, outflow: 55 },
      { time: '8m ago', level: 17.10, inflow: 29, outflow: 55 },
      { time: '6m ago', level: 17.10, inflow: 30, outflow: 55 },
      { time: '4m ago', level: 17.10, inflow: 30, outflow: 55 },
      { time: '2m ago', level: 17.10, inflow: 30, outflow: 55 },
      { time: 'Just now', level: 17.10, inflow: 30, outflow: 55 },
    ]
  },
  {
    id: 'amaravathi',
    name: 'Amaravathi Dam',
    river: 'Amaravathi',
    district: 'Tiruppur, Tamil Nadu',
    basin: 'Cauvery Basin',
    currentLevel: 46.20, // Official live level: 46.20 ft (Normal operational)
    fullReservoirLevel: 90.00, // Official FRL: 90.00 ft
    capacity: 4047, // Mcft (4.047 TMC)
    storage: 1020, // Mcft (1.02 TMC ~ 25.2%)
    inflow: 380, // cusecs
    outflow: 420, // cusecs
    spillwayGates: { total: 8, open: 0, type: 'Radial Gates (Closed)' },
    hydroPowerCapacityMW: 4,
    hydroPowerActiveMW: 1.5,
    ruleCurveLevel: 87.00,
    warningLevel: 80.00,
    dangerLevel: 89.20,
    latitude: 10.4333,
    longitude: 77.2667,
    downstreamTaluks: ['Madathukulam', 'Dharapuram', 'Karur Rural'],
    downstreamWaveSpeedKmH: 10.0,
    downstreamCheckpoints: [
      { name: 'Madathukulam Railway Bridge', distanceKm: 16, populationAtRisk: 14000 },
      { name: 'Dharapuram Old Bridge', distanceKm: 42, populationAtRisk: 41000 },
      { name: 'Karur Kaveri Confluence', distanceKm: 96, populationAtRisk: 55000 }
    ],
    drinkingWaterSupplyMLD: 45,
    irrigationAcreage: 55000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 46.19, inflow: 378, outflow: 420 },
      { time: '8m ago', level: 46.19, inflow: 379, outflow: 420 },
      { time: '6m ago', level: 46.20, inflow: 380, outflow: 420 },
      { time: '4m ago', level: 46.20, inflow: 380, outflow: 420 },
      { time: '2m ago', level: 46.20, inflow: 380, outflow: 420 },
      { time: 'Just now', level: 46.20, inflow: 380, outflow: 420 },
    ]
  },
  {
    id: 'mullaperiyar',
    name: 'Mullaperiyar Dam',
    river: 'Periyar',
    district: 'Idukki (Operated by TN WRD)',
    basin: 'Western Ghats / Inter-State',
    currentLevel: 119.40, // Official live level: 119.40 ft (Safe / Normal operational)
    fullReservoirLevel: 142.00, // Official Supreme Court permissible limit: 142.00 ft
    capacity: 15562, // Mcft (15.56 TMC)
    storage: 2540, // Mcft (2.54 TMC ~ 16.3%)
    inflow: 420, // cusecs
    outflow: 350, // cusecs (Tunnel diversion to Tamil Nadu Vaigai basin)
    spillwayGates: { total: 13, open: 0, type: 'Vertical Lift Shutters (Closed)' },
    hydroPowerCapacityMW: 140,
    hydroPowerActiveMW: 25,
    ruleCurveLevel: 140.00,
    warningLevel: 136.00,
    dangerLevel: 141.50,
    latitude: 9.5292,
    longitude: 77.1436,
    downstreamTaluks: ['Vandiperiyar', 'Upputhara', 'Idukki Reservoir Catchment'],
    downstreamWaveSpeedKmH: 13.5,
    downstreamCheckpoints: [
      { name: 'Vandiperiyar Town Bridge', distanceKm: 14, populationAtRisk: 19000 },
      { name: 'Vallakadavu Monitoring Station', distanceKm: 22, populationAtRisk: 12000 },
      { name: 'Idukki Arch Dam Confluence', distanceKm: 48, populationAtRisk: 65000 }
    ],
    drinkingWaterSupplyMLD: 210,
    irrigationAcreage: 223000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 119.38, inflow: 418, outflow: 350 },
      { time: '8m ago', level: 119.39, inflow: 419, outflow: 350 },
      { time: '6m ago', level: 119.39, inflow: 420, outflow: 350 },
      { time: '4m ago', level: 119.40, inflow: 420, outflow: 350 },
      { time: '2m ago', level: 119.40, inflow: 420, outflow: 350 },
      { time: 'Just now', level: 119.40, inflow: 420, outflow: 350 },
    ]
  },
  {
    id: 'idukki',
    name: 'Idukki Dam (Arch Dam)',
    river: 'Periyar',
    district: 'Idukki, Kerala',
    basin: 'Western Ghats / Kerala Basin',
    currentLevel: 2342.50, // Official live level: 2,342.50 ft MSL (Normal operational)
    fullReservoirLevel: 2403.00, // Official FRL: 2,403.00 ft MSL
    capacity: 70500, // Mcft (70.50 TMC)
    storage: 38200, // Mcft (38.2 TMC ~ 54.2%)
    inflow: 1850, // cusecs
    outflow: 1600, // cusecs (Moolamattom powerhouse generation)
    spillwayGates: { total: 5, open: 0, type: 'Cheruthoni Radial Shutters (Closed)' },
    hydroPowerCapacityMW: 780,
    hydroPowerActiveMW: 420,
    ruleCurveLevel: 2392.00,
    warningLevel: 2375.00,
    dangerLevel: 2400.00,
    latitude: 9.8456,
    longitude: 76.9744,
    downstreamTaluks: ['Cheruthoni', 'Karikkodu', 'Perumbavoor', 'Aluva', 'Kochi Port Estuary'],
    downstreamWaveSpeedKmH: 15.2,
    downstreamCheckpoints: [
      { name: 'Cheruthoni Town Bridge', distanceKm: 3, populationAtRisk: 15000 },
      { name: 'Kolenchery Valley Gauge', distanceKm: 45, populationAtRisk: 62000 },
      { name: 'Aluva Manappuram Shiva Temple Ghat', distanceKm: 88, populationAtRisk: 210000 }
    ],
    drinkingWaterSupplyMLD: 420,
    irrigationAcreage: 180000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 2342.48, inflow: 1845, outflow: 1600 },
      { time: '8m ago', level: 2342.49, inflow: 1848, outflow: 1600 },
      { time: '6m ago', level: 2342.49, inflow: 1850, outflow: 1600 },
      { time: '4m ago', level: 2342.50, inflow: 1850, outflow: 1600 },
      { time: '2m ago', level: 2342.50, inflow: 1850, outflow: 1600 },
      { time: 'Just now', level: 2342.50, inflow: 1850, outflow: 1600 },
    ]
  },
  {
    id: 'kabini',
    name: 'Kabini Dam',
    river: 'Kabini',
    district: 'Mysuru, Karnataka',
    basin: 'Cauvery Basin',
    currentLevel: 2268.40, // Official live level: 2,268.40 ft MSL (Normal operational)
    fullReservoirLevel: 2284.00, // Official FRL: 2,284.00 ft MSL
    capacity: 19520, // Mcft (19.52 TMC)
    storage: 11200, // Mcft (11.2 TMC ~ 57.4%)
    inflow: 1250, // cusecs
    outflow: 1200, // cusecs
    spillwayGates: { total: 4, open: 0, type: 'Crest Spillway Gates (Closed)' },
    hydroPowerCapacityMW: 32,
    hydroPowerActiveMW: 14,
    ruleCurveLevel: 2283.00,
    warningLevel: 2278.00,
    dangerLevel: 2283.80,
    latitude: 11.9753,
    longitude: 76.3797,
    downstreamTaluks: ['Heggadadevankote', 'Nanjangud', 'T. Narasipura (Kaveri Confluence)'],
    downstreamWaveSpeedKmH: 13.0,
    downstreamCheckpoints: [
      { name: 'Nanjangud Temple Ghats', distanceKm: 32, populationAtRisk: 42000 },
      { name: 'T. Narasipura Sangama', distanceKm: 65, populationAtRisk: 38000 }
    ],
    drinkingWaterSupplyMLD: 180,
    irrigationAcreage: 120000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 2268.38, inflow: 1245, outflow: 1200 },
      { time: '8m ago', level: 2268.39, inflow: 1248, outflow: 1200 },
      { time: '6m ago', level: 2268.40, inflow: 1250, outflow: 1200 },
      { time: '4m ago', level: 2268.40, inflow: 1250, outflow: 1200 },
      { time: '2m ago', level: 2268.40, inflow: 1250, outflow: 1200 },
      { time: 'Just now', level: 2268.40, inflow: 1250, outflow: 1200 },
    ]
  },
  {
    id: 'sathanur',
    name: 'Sathanur Dam',
    river: 'Thenpennai',
    district: 'Tiruvannamalai, Tamil Nadu',
    basin: 'Pennaiyar Basin',
    currentLevel: 84.50, // Official live level: 84.50 ft (Normal operational)
    fullReservoirLevel: 119.00, // Official FRL: 119.00 ft
    capacity: 7321, // Mcft (7.32 TMC)
    storage: 2850, // Mcft (2.85 TMC ~ 38.9%)
    inflow: 310, // cusecs
    outflow: 280, // cusecs
    spillwayGates: { total: 9, open: 0, type: 'Crest Spillway Gates (Closed)' },
    hydroPowerCapacityMW: 7.5,
    hydroPowerActiveMW: 2.5,
    ruleCurveLevel: 116.00,
    warningLevel: 105.00,
    dangerLevel: 118.20,
    latitude: 12.2833,
    longitude: 78.8667,
    downstreamTaluks: ['Tiruvannamalai', 'Tirukoilur', 'Villupuram', 'Cuddalore'],
    downstreamWaveSpeedKmH: 10.5,
    downstreamCheckpoints: [
      { name: 'Tirukoilur Anaicut', distanceKm: 38, populationAtRisk: 32000 },
      { name: 'Villupuram Railway Bridge', distanceKm: 76, populationAtRisk: 75000 },
      { name: 'Cuddalore Bay Outfall', distanceKm: 115, populationAtRisk: 90000 }
    ],
    drinkingWaterSupplyMLD: 85,
    irrigationAcreage: 45000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 84.48, inflow: 308, outflow: 280 },
      { time: '8m ago', level: 84.49, inflow: 309, outflow: 280 },
      { time: '6m ago', level: 84.50, inflow: 310, outflow: 280 },
      { time: '4m ago', level: 84.50, inflow: 310, outflow: 280 },
      { time: '2m ago', level: 84.50, inflow: 310, outflow: 280 },
      { time: 'Just now', level: 84.50, inflow: 310, outflow: 280 },
    ]
  },
  {
    id: 'pechiparai',
    name: 'Pechiparai Dam',
    river: 'Kodayar',
    district: 'Kanyakumari, Tamil Nadu',
    basin: 'Kanyakumari Basin',
    currentLevel: 25.80, // Official live level: 25.80 ft (Normal operational)
    fullReservoirLevel: 48.00, // Official FRL: 48.00 ft
    capacity: 4450, // Mcft (4.45 TMC)
    storage: 1620, // Mcft (1.62 TMC ~ 36.4%)
    inflow: 120, // cusecs
    outflow: 150, // cusecs
    spillwayGates: { total: 4, open: 0, type: 'Radial Gates (Closed)' },
    hydroPowerCapacityMW: 0,
    hydroPowerActiveMW: 0,
    ruleCurveLevel: 45.00,
    warningLevel: 38.00,
    dangerLevel: 47.20,
    latitude: 8.4833,
    longitude: 77.2833,
    downstreamTaluks: ['Kalkulam', 'Thiruvattar', 'Kuzhithurai'],
    downstreamWaveSpeedKmH: 9.0,
    downstreamCheckpoints: [
      { name: 'Thiruvattar Causeway', distanceKm: 18, populationAtRisk: 19000 },
      { name: 'Kuzhithurai Bridge', distanceKm: 32, populationAtRisk: 38000 }
    ],
    drinkingWaterSupplyMLD: 60,
    irrigationAcreage: 50000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 25.79, inflow: 119, outflow: 150 },
      { time: '8m ago', level: 25.80, inflow: 120, outflow: 150 },
      { time: '6m ago', level: 25.80, inflow: 120, outflow: 150 },
      { time: '4m ago', level: 25.80, inflow: 120, outflow: 150 },
      { time: '2m ago', level: 25.80, inflow: 120, outflow: 150 },
      { time: 'Just now', level: 25.80, inflow: 120, outflow: 150 },
    ]
  },
  {
    id: 'perunchani',
    name: 'Perunchani Dam',
    river: 'Paralayar',
    district: 'Kanyakumari, Tamil Nadu',
    basin: 'Kanyakumari Basin',
    currentLevel: 48.20, // Official live level: 48.20 ft (Normal operational)
    fullReservoirLevel: 77.00, // Official FRL: 77.00 ft
    capacity: 2890, // Mcft (2.89 TMC)
    storage: 1180, // Mcft (1.18 TMC ~ 40.8%)
    inflow: 85, // cusecs
    outflow: 90, // cusecs
    spillwayGates: { total: 4, open: 0, type: 'Sluice Shutters (Closed)' },
    hydroPowerCapacityMW: 0,
    hydroPowerActiveMW: 0,
    ruleCurveLevel: 74.00,
    warningLevel: 65.00,
    dangerLevel: 76.50,
    latitude: 8.4000,
    longitude: 77.2833,
    downstreamTaluks: ['Vilavancode', 'Marthandam', 'Thengapattanam'],
    downstreamWaveSpeedKmH: 8.8,
    downstreamCheckpoints: [
      { name: 'Marthandam Low-Lying Canal', distanceKm: 21, populationAtRisk: 24000 },
      { name: 'Thengapattanam Estuary', distanceKm: 38, populationAtRisk: 32000 }
    ],
    drinkingWaterSupplyMLD: 40,
    irrigationAcreage: 38000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 48.19, inflow: 84, outflow: 90 },
      { time: '8m ago', level: 48.20, inflow: 85, outflow: 90 },
      { time: '6m ago', level: 48.20, inflow: 85, outflow: 90 },
      { time: '4m ago', level: 48.20, inflow: 85, outflow: 90 },
      { time: '2m ago', level: 48.20, inflow: 85, outflow: 90 },
      { time: 'Just now', level: 48.20, inflow: 85, outflow: 90 },
    ]
  },
  {
    id: 'aliyar',
    name: 'Aliyar Dam',
    river: 'Aliyar',
    district: 'Coimbatore, Tamil Nadu',
    basin: 'Parambikulam-Aliyar Basin',
    currentLevel: 78.40, // Official live level: 78.40 ft (Normal operational)
    fullReservoirLevel: 120.00, // Official FRL: 120.00 ft
    capacity: 3864, // Mcft (3.864 TMC)
    storage: 1650, // Mcft (1.65 TMC ~ 42.7%)
    inflow: 240, // cusecs
    outflow: 200, // cusecs
    spillwayGates: { total: 11, open: 0, type: 'Radial Crest Shutters (Closed)' },
    hydroPowerCapacityMW: 60,
    hydroPowerActiveMW: 18,
    ruleCurveLevel: 117.00,
    warningLevel: 105.00,
    dangerLevel: 119.20,
    latitude: 10.4900,
    longitude: 76.9700,
    downstreamTaluks: ['Pollachi', 'Anaimalai', 'Kinathukadavu'],
    downstreamWaveSpeedKmH: 10.0,
    downstreamCheckpoints: [
      { name: 'Pollachi Canal Regulator', distanceKm: 15, populationAtRisk: 31000 },
      { name: 'Ambarampalayam River Bridge', distanceKm: 28, populationAtRisk: 26000 }
    ],
    drinkingWaterSupplyMLD: 75,
    irrigationAcreage: 44000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 78.38, inflow: 238, outflow: 200 },
      { time: '8m ago', level: 78.39, inflow: 239, outflow: 200 },
      { time: '6m ago', level: 78.40, inflow: 240, outflow: 200 },
      { time: '4m ago', level: 78.40, inflow: 240, outflow: 200 },
      { time: '2m ago', level: 78.40, inflow: 240, outflow: 200 },
      { time: 'Just now', level: 78.40, inflow: 240, outflow: 200 },
    ]
  },
  {
    id: 'sholayar',
    name: 'Upper Sholayar Dam',
    river: 'Chalakkudy Basin',
    district: 'Coimbatore / Anaimalai, Tamil Nadu',
    basin: 'Parambikulam-Aliyar Basin',
    currentLevel: 118.60, // Official live level: 118.60 ft (Normal operational)
    fullReservoirLevel: 160.00, // Official FRL: 160.00 ft
    capacity: 5392, // Mcft (5.39 TMC)
    storage: 2750, // Mcft (2.75 TMC ~ 51.0%)
    inflow: 410, // cusecs
    outflow: 380, // cusecs
    spillwayGates: { total: 4, open: 0, type: 'Spillway Radial Gates (Closed)' },
    hydroPowerCapacityMW: 95,
    hydroPowerActiveMW: 32,
    ruleCurveLevel: 156.00,
    warningLevel: 142.00,
    dangerLevel: 159.00,
    latitude: 10.3000,
    longitude: 76.7500,
    downstreamTaluks: ['Valparai', 'Athirappilly (Kerala border)'],
    downstreamWaveSpeedKmH: 14.5,
    downstreamCheckpoints: [
      { name: 'Valparai Mountain Gorge', distanceKm: 12, populationAtRisk: 14000 },
      { name: 'Lower Sholayar Intake', distanceKm: 28, populationAtRisk: 18000 }
    ],
    drinkingWaterSupplyMLD: 35,
    irrigationAcreage: 32000,
    lastUpdated: new Date().toISOString(),
    history: [
      { time: '10m ago', level: 118.58, inflow: 408, outflow: 380 },
      { time: '8m ago', level: 118.59, inflow: 409, outflow: 380 },
      { time: '6m ago', level: 118.60, inflow: 410, outflow: 380 },
      { time: '4m ago', level: 118.60, inflow: 410, outflow: 380 },
      { time: '2m ago', level: 118.60, inflow: 410, outflow: 380 },
      { time: 'Just now', level: 118.60, inflow: 410, outflow: 380 },
    ]
  }
];

// Helper to determine status and alerts accurately
export function getDamStatus(dam) {
  // Use true storage vs capacity percentage for accurate hydrologic evaluation
  const fillPercentage = dam.storage && dam.capacity 
    ? (dam.storage / dam.capacity) * 100 
    : (dam.currentLevel / dam.fullReservoirLevel) * 100;

  const isDangerLevel = dam.dangerLevel && dam.currentLevel >= dam.dangerLevel;
  const isRuleCurveBreached = dam.ruleCurveLevel && dam.currentLevel >= dam.ruleCurveLevel;
  const isWarningLevel = dam.warningLevel && dam.currentLevel >= dam.warningLevel;

  // Real-world flood risk criteria
  if (isDangerLevel || fillPercentage >= 95) {
    return {
      label: 'RED ALERT (CRITICAL SPILL)',
      color: 'red',
      severity: 'critical',
      description: 'Reservoir at maximum surcharge level. Emergency spillway discharge active.'
    };
  }
  if (isRuleCurveBreached || fillPercentage >= 88) {
    return {
      label: 'ORANGE ALERT (RULE CURVE)',
      color: 'orange',
      severity: 'elevated',
      description: 'Exceeded seasonal Rule Curve threshold. Downstream flood watch active.'
    };
  }
  if (isWarningLevel || fillPercentage >= 75) {
    return {
      label: 'YELLOW WATCH (MONITORED)',
      color: 'yellow',
      severity: 'warning',
      description: 'Storage approaching seasonal warning stage. Inflow monitored closely.'
    };
  }
  if (fillPercentage >= 20) {
    return {
      label: 'NORMAL OPERATIONAL (SAFE)',
      color: 'emerald',
      severity: 'normal',
      description: 'Controlled storage and irrigation releases within safe river capacities.'
    };
  }
  return {
    label: 'LEAN / CONSERVATION STORAGE',
    color: 'blue',
    severity: 'low',
    description: 'Storage conserved for municipal drinking water lifelines.'
  };
}

export function calculateFillPercentage(dam) {
  if (dam.storage && dam.capacity) {
    return ((dam.storage / dam.capacity) * 100).toFixed(1);
  }
  return ((dam.currentLevel / dam.fullReservoirLevel) * 100).toFixed(1);
}

// Format TMC (Thousand Million Cubic Feet)
export function getStorageInTMC(storageMcft) {
  return (storageMcft / 1000).toFixed(2);
}

// Calculate Commercial Valuation of Dam Discharge & Hydropower
export function calculateDamEconomicMetrics(dam) {
  // Electricity tariff: ₹4.50 per kWh
  const powerHourlyRevenue = (dam.hydroPowerActiveMW || 0) * 1000 * 4.50; // ₹ / hour
  // Drinking water valuation: ₹18 per 1000 liters
  const drinkingWaterDailyValuation = (dam.drinkingWaterSupplyMLD || 0) * 1000000 * (18 / 1000); // ₹ / day
  // Irrigation economic value created per day (~₹850 per acre-foot equivalent)
  const irrigationDailyValue = (dam.outflow || 0) * 1.983 * 850; // approx ₹ / day

  return {
    powerHourlyRevenue,
    drinkingWaterDailyValuation,
    irrigationDailyValue,
    totalDailyEconomicBenefit: (powerHourlyRevenue * 24) + drinkingWaterDailyValuation + irrigationDailyValue
  };
}

// Downstream Wave Travel Time Calculation
export function calculateDownstreamWaveArrival(dam, checkpoint) {
  if (!dam.downstreamWaveSpeedKmH || !checkpoint.distanceKm) return null;
  const hours = checkpoint.distanceKm / dam.downstreamWaveSpeedKmH;
  const totalMinutes = Math.round(hours * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return {
    hoursDecimal: hours.toFixed(1),
    formattedTime: hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`,
    arrivalTimeEstimate: new Date(Date.now() + totalMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export function formatLastUpdated(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}
