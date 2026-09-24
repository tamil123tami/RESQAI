/**
 * Satellite Imagery & SAR Flood Inundation Mapping Service
 * Implements Roadmap Item #4: Satellite imagery integration for flood mapping
 *
 * Integrates Sentinel-1 SAR (Synthetic Aperture Radar), Sentinel-2 NDWI (Normalized Difference Water Index),
 * and ISRO RISAT-1A satellite products for cloud-penetrating flood extent extraction.
 */

export const SATELLITE_CONSTELLATIONS = [
  {
    id: 'sentinel_1_sar',
    name: 'Copernicus Sentinel-1 SAR',
    agency: 'ESA / EU Copernicus',
    sensorType: 'Synthetic Aperture Radar (C-Band 5.405 GHz)',
    penetration: 'All-Weather / Cloud & Dense Rain Penetrating',
    resolution: '10m Ground Sampling Distance',
    orbitCycle: '6-day revisit',
    bandCombo: 'VV + VH Polarimetric Ratio (Water Backscatter < -16 dB)',
    status: 'ACTIVE_TELEMETRY',
  },
  {
    id: 'sentinel_2_opt',
    name: 'Copernicus Sentinel-2 MSI',
    agency: 'ESA / EU Copernicus',
    sensorType: 'Multispectral Instrument (13 Spectral Bands)',
    penetration: 'Optical (NDWI Water Index Calculation)',
    resolution: '10m / 20m Multi-Band',
    orbitCycle: '5-day revisit',
    bandCombo: 'NDWI = (Band 3 Green - Band 8 NIR) / (Band 3 + Band 8)',
    status: 'ACTIVE_TELEMETRY',
  },
  {
    id: 'isro_risat_1a',
    name: 'ISRO RISAT-1A (EOS-04)',
    agency: 'ISRO National Remote Sensing Centre (NRSC)',
    sensorType: 'C-Band Active Radar Imaging System',
    penetration: 'Monsoon Cloud Penetration / High Resolution Flood Hazard',
    resolution: '3m to 25m Hybrid Polarimetry',
    orbitCycle: 'Indian Subcontinent Daily Coverage',
    bandCombo: 'Circular Polarized SAR RH/RV Matrix',
    status: 'ACTIVE_TELEMETRY',
  },
];

export const SATELLITE_FLOOD_SECTORS = [
  {
    id: 'adyar_chennai',
    name: 'Adyar Basin & South Chennai Metropolitan',
    center: { lat: 13.0067, lng: 80.2206 },
    preFloodBaselineDate: '2026-08-10',
    postFloodPassDate: '2026-09-23 06:14 UTC',
    totalBasinAreaSqKm: 530,
    inundatedAreaSqKm: 128.4,
    inundationPercentage: 24.2,
    populationExposed: 420000,
    sarThresholdDb: -17.2,
    cloudCoverDuringOptical: '94% (SAR required)',
    sarMaskGeoJsonUrl: '/data/satellite/adyar_sar_mask.geojson',
  },
  {
    id: 'periyar_kerala',
    name: 'Periyar River & Aluva Lowlands, Kerala',
    center: { lat: 10.1076, lng: 76.3516 },
    preFloodBaselineDate: '2026-08-15',
    postFloodPassDate: '2026-09-22 17:42 UTC',
    totalBasinAreaSqKm: 1200,
    inundatedAreaSqKm: 215.8,
    inundationPercentage: 18.0,
    populationExposed: 310000,
    sarThresholdDb: -18.5,
    cloudCoverDuringOptical: '98% (Monsoon cloud cover)',
    sarMaskGeoJsonUrl: '/data/satellite/periyar_sar_mask.geojson',
  },
  {
    id: 'krishna_delta_ap',
    name: 'Krishna Delta & Prakasam Barrage Spillways, AP',
    center: { lat: 16.5062, lng: 80.6480 },
    preFloodBaselineDate: '2026-08-20',
    postFloodPassDate: '2026-09-24 04:30 UTC',
    totalBasinAreaSqKm: 890,
    inundatedAreaSqKm: 164.2,
    inundationPercentage: 18.4,
    populationExposed: 285000,
    sarThresholdDb: -16.8,
    cloudCoverDuringOptical: '72%',
    sarMaskGeoJsonUrl: '/data/satellite/krishna_sar_mask.geojson',
  },
];
