import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function NativeTripCard({
  trip,
  onToggleExpand,
  isExpanded = true,
  onRutaPress,
  onCallDriver,
  onPriorityChange,
  onToggleFavorite,
  selectedPriority = 0,
  isFavorite = false,
}) {
  if (!trip || !trip.id) {
    return null;
  }

  const driver = trip.driver || null;
  const fare = trip.fare || null;
  const pointsOfInterest = Array.isArray(trip.pointsOfInterest)
    ? trip.pointsOfInterest
    : [];
  const priorityOptions = Array.isArray(trip.priorityOptions)
    ? [...new Set(trip.priorityOptions.filter(
        value => typeof value === 'number'
          && Number.isFinite(value) && value >= 0
      ))]
    : [];

  const currency = typeof fare?.currency === 'string'
    && fare.currency.trim()
    ? fare.currency.trim()
    : 'DOP';
  const hasFare = typeof fare?.totalFare === 'number'
    && Number.isFinite(fare.totalFare);

  const initials = driver?.name
    ? driver.name.trim().split(/\s+/).slice(0, 2)
        .map(part => part[0]).join('').toUpperCase()
    : '--';

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.handle}
        onPress={onToggleExpand}
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? 'Contraer seguimiento' : 'Expandir seguimiento'
        }
      >
        <View style={styles.handleBar} />
        <Text style={styles.handleText}>
          {isExpanded ? 'Ocultar detalles' : 'Ver seguimiento'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>COPILOTRD®</Text>
              <Text style={styles.title}>Seguimiento del viaje</Text>
              <Text style={styles.subtitle}>
                {trip.statusText || 'Estado pendiente de actualización'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.routeButton}
              onPress={onRutaPress}
              disabled={!onRutaPress}
            >
              <Text style={styles.routeButtonText}>Ruta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {priorityOptions.length > 0 && onPriorityChange && (
            <View style={styles.priorityCard}>
              <Text style={styles.priorityTitle}>⚡ PRIORIDAD</Text>
              <View style={styles.priorityRow}>
                {priorityOptions.map(value => (
                  <TouchableOpacity
                    key={String(value)}
                    onPress={() => onPriorityChange(value)}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: selectedPriority === value,
                    }}
                    style={[
                      styles.priorityChip,
                      selectedPriority === value
                        && styles.priorityChipActive,
                    ]}
                  >
                    <Text style={styles.priorityChipText}>
                      {'+' + value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Categoría</Text>
              <Text style={styles.value}>
                {trip.category || 'No informada'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Tarifa confirmada</Text>
              <Text style={styles.price}>
                {hasFare
                  ? `${currency} ${fare.totalFare.toFixed(2)}`
                  : 'Pendiente'}
              </Text>
            </View>
          </View>

          <View style={styles.driverCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>
                {driver?.name || 'Conductor pendiente'}
              </Text>
              <Text style={styles.driverDetails}>
                {driver
                  ? [driver.vehicle, driver.plate]
                      .filter(Boolean).join(' • ') || 'Datos pendientes'
                  : 'Esperando asignación del servidor'}
              </Text>
              {typeof driver?.rating === 'number'
                && Number.isFinite(driver.rating) && (
                <Text style={styles.driverRating}>
                  {'★ ' + driver.rating.toFixed(2)}
                  {typeof driver.completedTrips === 'number'
                    ? ` · ${driver.completedTrips} viajes`
                    : ''}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Tiempo restante</Text>
              <Text style={styles.value}>
                {trip.remainingTimeText || 'No disponible'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Destino</Text>
              <Text style={styles.value} numberOfLines={2}>
                {trip.destinationAddress || 'No disponible'}
              </Text>
            </View>
          </View>

          {pointsOfInterest.length > 0 && (
            <View style={styles.poiCard}>
              <Text style={styles.poiTitle}>
                Puntos de interés y paradas
              </Text>
              {pointsOfInterest
                .filter(point => point && typeof point.title === 'string')
                .map((point, index) => (
                  <Text
                    key={point.id != null ? String(point.id) : String(index)}
                    style={styles.poiText}
                  >
                    {'📍 ' + point.title}
                  </Text>
                ))}
            </View>
          )}

          {driver?.id != null && onToggleFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => onToggleFavorite(!isFavorite)}
              accessibilityRole="button"
              accessibilityState={{ selected: isFavorite }}
            >
              <Text style={styles.favoriteText}>
                {isFavorite
                  ? '★ Conductor favorito'
                  : '☆ Agregar conductor a favoritos'}
              </Text>
            </TouchableOpacity>
          )}

          {driver?.phone && onCallDriver && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => onCallDriver(driver.phone)}
            >
              <Text style={styles.contactText}>
                Contactar conductor
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EDEFF2',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  handle: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  handleText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  content: { gap: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: '#111827',
    fontSize: 19,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },
  routeButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 4,
  },
  value: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  price: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '900',
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  driverName: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 13,
  },
  driverDetails: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },
  driverRating: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  poiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  poiTitle: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  poiText: {
    color: '#334155',
    fontSize: 12,
    marginTop: 4,
  },
  priorityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  priorityTitle: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  priorityChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  priorityChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  priorityChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  favoriteButton: {
    backgroundColor: '#4A1559',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  favoriteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  contactButton: {
    backgroundColor: '#334155',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  contactText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
