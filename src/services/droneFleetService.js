/**
 * Drone Fleet Surveillance & AI Object Detection Service
 * Implements Roadmap Item #8: Drone surveillance feed integration
 *
 * Manages autonomous UAV squadrons, live flight HUD telemetry,
 * thermal FLIR vision simulation, and real-time computer vision object detection.
 */

export const DRONE_SQUADRONS = [
  {
    id: 'uav_echo_1',
    callsign: 'Echo-1 (Adyar Quad)',
    model: 'DJI Matrice 350 RTK Disaster Spec',
    sector: 'Adyar River Basin & Saidapet Bridge, Chennai',
    lat: 13.0180,
    lng: 80.2220,
    altitudeM: 85,
    speedKmh: 34,
    batteryPct: 82,
    signalDbm: -64,
    headingDeg: 128,
    flightTimeMin: 32,
    streamFps: 30,
    activeSensor: '4K Optical 30x Zoom',
    supportThermal: true,
    detectedObjects: [
      { id: 'det_1', label: 'Stranded Civilians (3 persons)', conf: 0.97, severity: 'critical', box: { x: 38, y: 44, w: 22, h: 28 }, status: 'AWAITING_RESCUE' },
      { id: 'det_2', label: 'Submerged Vehicle (Van)', conf: 0.93, severity: 'warning', box: { x: 68, y: 62, w: 18, h: 16 }, status: 'UNOCCUPIED' },
    ],
  },
  {
    id: 'uav_echo_2',
    callsign: 'Echo-2 (Spillway Thermal)',
    model: 'Autel Dragonfish VTOL High-Endurance',
    sector: 'Chembarambakkam Lake Spillway & Bund',
    lat: 13.0080,
    lng: 80.0210,
    altitudeM: 140,
    speedKmh: 28,
    batteryPct: 69,
    signalDbm: -72,
    headingDeg: 245,
    flightTimeMin: 55,
    streamFps: 30,
    activeSensor: 'FLIR Boson 640x512 Thermal LWIR',
    supportThermal: true,
    detectedObjects: [
      { id: 'det_3', label: 'Embankment Stress Fracture (2.4m)', conf: 0.89, severity: 'critical', box: { x: 42, y: 52, w: 26, h: 20 }, status: 'STRUCTURAL_ALERT' },
      { id: 'det_4', label: 'Livestock Herd (14 cattle trapped)', conf: 0.95, severity: 'info', box: { x: 18, y: 35, w: 20, h: 22 }, status: 'EVAC_RECOMMENDED' },
    ],
  },
  {
    id: 'uav_echo_3',
    callsign: 'Echo-3 (Wayanad High-Altitude)',
    model: 'IdeaForge SWITCH VTOL Heavy Lift',
    sector: 'Chooralmala & Meppadi Landslide Zone, Kerala',
    lat: 11.5342,
    lng: 76.1680,
    altitudeM: 320,
    speedKmh: 64,
    batteryPct: 88,
    signalDbm: -58,
    headingDeg: 42,
    flightTimeMin: 42,
    streamFps: 60,
    activeSensor: 'LiDAR Terrain Profiler + Optical 4K',
    supportThermal: true,
    detectedObjects: [
      { id: 'det_5', label: 'Debris Flow Damming Culvert', conf: 0.96, severity: 'critical', box: { x: 50, y: 38, w: 30, h: 24 }, status: 'FLASH_FLOOD_TRIGGER' },
    ],
  },
];
