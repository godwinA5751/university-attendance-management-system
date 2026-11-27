
export interface GeoLocationInput {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const MAX_GPS_ACCURACY_METERS = 50;

export const validateGeoLocation = (
  location: GeoLocationInput
): void => {
  const { latitude, longitude, accuracy } = location;

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error("Invalid latitude");
  }

  if (
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid longitude");
  }

  if (
    typeof accuracy !== "number" ||
    !Number.isFinite(accuracy) ||
    accuracy <= 0
  ) {
    throw new Error("Invalid GPS accuracy");
  }

  if (accuracy > MAX_GPS_ACCURACY_METERS) {
    throw new Error(
      "GPS accuracy is insufficient. Please retry your location check."
    );
  }
};

export const calculateDistanceMeters = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number => {
  validateGeoLocation({
    latitude: latitude1,
    longitude: longitude1,
    accuracy: 1,
  });

  validateGeoLocation({
    latitude: latitude2,
    longitude: longitude2,
    accuracy: 1,
  });

  const earthRadiusMeters = 6371000;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle =
    2 * Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(1 - haversine)
    );

  return Math.round(earthRadiusMeters * centralAngle * 100) / 100;
};
