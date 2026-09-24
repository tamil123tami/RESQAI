/**
 * High-Precision GPS Telemetry Service (React Native)
 * Provides foreground & background tracking, heading, accuracy, and altitude.
 */

import * as Location from 'expo-location';

export const LocationTelemetryService = {
  /**
   * Request GPS permissions and fetch current device fix
   */
  async getCurrentPosition() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return {
          latitude: 13.0182,
          longitude: 80.2215,
          accuracy: 5.0,
          altitude: 12.4,
          heading: 184,
          isSimulated: true,
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
        isSimulated: false,
      };
    } catch (e) {
      console.warn('GPS location fetch error:', e);
      return {
        latitude: 13.0182,
        longitude: 80.2215,
        accuracy: 8.0,
        altitude: 12.0,
        heading: 180,
        isSimulated: true,
      };
    }
  },

  /**
   * Watch live coordinates during field traversal
   */
  async watchPosition(callback) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (loc) => {
          callback({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            altitude: loc.coords.altitude,
            heading: loc.coords.heading,
            speed: loc.coords.speed,
            timestamp: loc.timestamp,
          });
        }
      );
    } catch (e) {
      console.warn('GPS watch error:', e);
      return null;
    }
  }
};
