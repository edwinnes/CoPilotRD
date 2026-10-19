// Servicio cartográfico para NósotrosRD Mobile
// Gestiona coordenadas clave, geocodificación estimada y cálculo de regiones para el mapa

export const DEFAULT_REGION = {
  latitude: 18.4861,
  longitude: -69.9312,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Coordenadas predeterminadas de referencia en Santo Domingo
export const DEFAULT_LOCATIONS = {
  pickup: {
    name: 'Av. Winston Churchill',
    latitude: 18.4861,
    longitude: -69.9312,
  },
  destination: {
    name: 'Hospital Plaza de la Salud',
    latitude: 18.4723,
    longitude: -69.8921,
  }
};

/**
 * Calcula los límites (bounding box) para ajustar la cámara del mapa
 * abarcando tanto el origen como el destino.
 */
export const calculateMapBounds = (pickupCoords, destCoords) => {
  const minLat = Math.min(pickupCoords.latitude, destCoords.latitude);
  const maxLat = Math.max(pickupCoords.latitude, destCoords.latitude);
  const minLng = Math.min(pickupCoords.longitude, destCoords.longitude);
  const maxLng = Math.max(pickupCoords.longitude, destCoords.longitude);

  const latitudeDelta = (maxLat - minLat) * 1.5 || 0.05;
  const longitudeDelta = (maxLng - minLng) * 1.5 || 0.05;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latitudeDelta, 0.04),
    longitudeDelta: Math.max(longitudeDelta, 0.04),
  };
};
