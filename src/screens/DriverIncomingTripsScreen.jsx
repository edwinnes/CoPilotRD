import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getIncomingTrips, updateTripStatus } from '../services/mobileApi';

export default function DriverIncomingTripsScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptedTripId, setAcceptedTripId] = useState(null);

  const fetchTrips = async () => {
    try {
      const res = await getIncomingTrips('drv-101');
      if (res?.dispatchedTrips) {
        setTrips(res.dispatchedTrips);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getIncomingTrips('drv-101').then((res) => {
      if (isMounted && res?.dispatchedTrips) {
        setTrips(res.dispatchedTrips);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAccept = async (tripId) => {
    setAcceptedTripId(tripId);
    await updateTripStatus(tripId, 'ASIGNADO');
    fetchTrips();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTrips(); }} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Radar de Viajes Entrantes</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>● EN LÍNEA</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : trips.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Buscando solicitudes cercanas...</Text>
          <Text style={styles.emptySubText}>Desliza hacia abajo para actualizar el radar.</Text>
        </View>
      ) : (
        trips.map((offer) => {
          const isFavorite = offer.favoriteDriverAdvanceTip?.enabled;
          const tipAmount = offer.favoriteDriverAdvanceTip?.amountDOP || 0;
          const isAccepted = acceptedTripId === offer.tripId || offer.status !== 'SOLICITADO';

          return (
            <View key={offer.tripId} style={[styles.card, isFavorite && styles.cardFavorite]}>
              {isFavorite && (
                <View style={styles.favoriteBadge}>
                  <Text style={styles.favoriteBadgeText}>⭐ ¡CHÓFER FAVORITO!</Text>
                  <Text style={styles.favoriteTipHighlight}>+RD$ {tipAmount} PROPINA ADELANTADA</Text>
                </View>
              )}

              <View style={styles.clientRow}>
                <Text style={styles.passengerName}>Pasajero: {offer.passenger?.name}</Text>
                <Text style={styles.codeText}>{offer.code}</Text>
              </View>

              <Text style={styles.routeText}>📍 Desde: {offer.route?.origin?.address}</Text>
              <Text style={styles.routeText}>🏁 Hasta: {offer.route?.destination?.address}</Text>

              <View style={styles.metricsRow}>
                <Text style={styles.metricText}>Distancia: {offer.route?.estimatedKm} KM</Text>
                <Text style={styles.metricText}>Tiempo: ~{offer.route?.estimatedMinutes} min</Text>
              </View>

              <View style={styles.earningsBox}>
                <Text style={styles.earningsLabel}>Tu Ganancia Neta Líquida:</Text>
                <Text style={styles.earningsValue}>
                  RD$ {offer.earningsSummary?.totalNetEarningsDOP || offer.fullFareBreakdown?.driverNetEarnings}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, isAccepted ? styles.buttonAccepted : styles.buttonActive]}
                onPress={() => handleAccept(offer.tripId)}
                disabled={isAccepted}
              >
                <Text style={styles.buttonText}>
                  {isAccepted ? '✓ Viaje Aceptado (Asignado)' : 'Aceptar Viaje Ahora'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scroll: { padding: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC' },
  statusBadge: { backgroundColor: '#064E3B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: '#34D399', fontSize: 11, fontWeight: 'bold' },
  emptyBox: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#64748B', fontSize: 13, marginTop: 6 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  cardFavorite: { borderColor: '#F59E0B', borderWidth: 2, backgroundColor: '#1C2136' },
  favoriteBadge: {
    backgroundColor: '#78350F',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteBadgeText: { color: '#FCD34D', fontWeight: 'bold', fontSize: 12 },
  favoriteTipHighlight: { color: '#34D399', fontWeight: 'bold', fontSize: 12 },
  clientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  passengerName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  codeText: { color: '#94A3B8', fontSize: 12, fontFamily: 'monospace' },
  routeText: { color: '#CBD5E1', fontSize: 13, marginBottom: 4 },
  metricsRow: { flexDirection: 'row', gap: 14, marginVertical: 8 },
  metricText: { color: '#60A5FA', fontSize: 12, fontWeight: '600' },
  earningsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: { color: '#94A3B8', fontSize: 13 },
  earningsValue: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  buttonActive: { backgroundColor: '#059669' },
  buttonAccepted: { backgroundColor: '#334155' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
