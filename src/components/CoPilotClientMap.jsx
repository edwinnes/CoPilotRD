import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NativeMap, { Marker } from 'react-native-maps';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { DEFAULT_REGION } from '../services/mapService';
export default function CoPilotClientMap({ onLocationSelect }) {
  const { location, error, loading, request } = useCurrentLocation();
  const locate = async () => {
    const coords = await request();
    if (coords) onLocationSelect?.(coords);
  };
  return <View style={{ flex: 1, backgroundColor: '#0A0E1A' }}>
    {<NativeMap style={{ flex: 1 }}
      region={location ? { ...DEFAULT_REGION, latitude: location.latitude, longitude: location.longitude } : DEFAULT_REGION}
      showsUserLocation={false}>
      {location && <Marker coordinate={location} title="Ubicación obtenida del dispositivo" />}
    </NativeMap>}
    <View style={{ position: 'absolute', top: 84, left: 16, right: 16, backgroundColor: '#0A0E1A', padding: 12 }}>
      <Text style={{ color: '#FFFFFF' }}>{error || (location ? 'Ubicación puntual. No es seguimiento de viaje.' : 'Vista de referencia. No indica tu posición ni una ruta activa.')}</Text>
      <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={locate} style={{ padding: 12 }}>
        <Text style={{ color: '#38BDF8' }}>{loading ? 'Obteniendo GPS…' : 'Usar mi ubicación'}</Text>
      </TouchableOpacity>
    </View>
  </View>;
}
