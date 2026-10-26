import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { AppState } from 'react-native';
export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const alive = useRef(true);
  const generation = useRef(0);
  const busy = useRef(false);
  useEffect(() => {
    alive.current = true;
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') { ++generation.current; setLocation(null); setLoading(false); }
    });
    return () => { alive.current = false; ++generation.current; sub.remove(); };
  }, []);
  const request = useCallback(async () => {
    if (busy.current) return null;
    busy.current = true;
    const current = ++generation.current;
    setLoading(true); setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Permiso de ubicación denegado.');
      if (!await Location.hasServicesEnabledAsync()) throw new Error('Activa el GPS del dispositivo.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!Number.isFinite(position.coords.latitude) || !Number.isFinite(position.coords.longitude) ||
          Math.abs(position.coords.latitude) > 90 || Math.abs(position.coords.longitude) > 180) {
        throw new Error('El dispositivo devolvió coordenadas inválidas.');
      }
      if (!alive.current || current !== generation.current) return null;
      setLocation(position.coords);
      return position.coords;
    } catch (err) { if (alive.current && current === generation.current) setError(err.message); return null; }
    finally { busy.current = false; if (alive.current && current === generation.current) setLoading(false); }
  }, []);
  return { location, error, loading, request };
}
