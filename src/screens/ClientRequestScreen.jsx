import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { requestTrip, getDeviceSecurityInfo } from '../services/mobileApi';
import CoPilotLogo from '../components/CoPilotLogo';
import CoPilotClientMap from '../components/CoPilotClientMap';

/**
 * Pantalla Principal Local (Nativa) de Pasajeros / Cliente
 * Funciona de forma 100% local sin depender del esquema SDUI remoto
 */
export default function ClientRequestScreen({ user, onLogout, onOpenSdui }) {
  const [origin, setOrigin] = useState('Av. Winston Churchill, Piantini');
  const [destination, setDestination] = useState('Aeropuerto Int. Las Américas (AILA)');
  const [selectedCategory, setSelectedCategory] = useState('Clásico');
  const [isFavoriteDriver, setIsFavoriteDriver] = useState(true);
  const [tipAmount, setTipAmount] = useState(150);
  const [loading, setLoading] = useState(false);
  const [tripResult, setTripResult] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const deviceInfo = getDeviceSecurityInfo();

  const clientName = user?.fullName || 'María Elena Ventura';
  const clientEmail = user?.email || 'pasajero.nosotrosrd@gmail.com';
  const clientPhone = user?.phone || '+1 809-555-0142';

  const quickDestinations = [
    { label: 'Aeropuerto AILA', address: 'Aeropuerto Int. Las Américas (AILA)' },
    { label: 'BlueMall', address: 'BlueMall, Av. Winston Churchill' },
    { label: 'Zona Colonial', address: 'Calle Las Damas, Zona Colonial' },
    { label: 'Bella Vista', address: 'Bella Vista Mall, Av. Sarasota' },
  ];

  const categories = [
    { id: 'Clásico', name: 'Clásico', price: 290, desc: 'Económico y rápido' },
    { id: 'Confort', name: 'Confort', price: 410, desc: 'Sedán amplio con A/C' },
    { id: 'XL', name: 'CoPilot XL', price: 580, desc: '6 pasajeros con maletas' },
  ];

  const handleRequestTrip = async () => {
    setLoading(true);
    setValidationError(null);
    setTripResult(null);

    const response = await requestTrip({
      originAddress: origin,
      destinationAddress: destination,
      category: selectedCategory,
      distanceKm: 31.5,
      durationMinutes: 40,
      isFavoriteDriver,
      favoriteTipDOP: tipAmount,
      clientId: user?.id || 'cli-01',
      clientName,
      clientPhone,
    });

    setLoading(false);

    if (response?.success && response?.trip) {
      setTripResult(response.trip);
    } else {
      setValidationError(response?.message || 'Error en validación de seguridad.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* 1. Header con Logo Oficial y Badge de Pantalla Local */}
      <View style={styles.topHeader}>
        <View style={styles.brandBadgeRow}>
          <CoPilotLogo size={42} />
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>CoPilot<Text style={styles.brandAccent}>RD</Text></Text>
              <Text style={styles.brandRegistered}>®</Text>
            </View>
            <Text style={styles.brandSubtitle}>NosotrosRD • Pasajeros</Text>
          </View>
        </View>

        <View style={styles.localPillBadge}>
          <View style={styles.localDot} />
          <Text style={styles.localPillText}>PANTALLA LOCAL NATIVA</Text>
        </View>
      </View>

      {/* 2. Tarjeta de Usuario Autenticado */}
      <View style={styles.userCard}>
        <View style={styles.userInfoRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {clientName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameBadgeRow}>
              <Text style={styles.userName} numberOfLines={1}>{clientName}</Text>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>✓ Verificado</Text>
              </View>
            </View>
            <Text style={styles.userSubText} numberOfLines={1}>{clientEmail}</Text>
            <Text style={styles.userPhoneText}>{clientPhone}</Text>
          </View>
          {onLogout && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Salir</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.authNoticeBanner}>
          <Text style={styles.authNoticeText}>
            🔒 Autenticación exitosa • Sesión iniciada y sincronizada localmente
          </Text>
        </View>
      </View>

      {/* 3. Verificación de Seguridad del Dispositivo */}
      <View style={styles.securityBox}>
        <View style={styles.securityHeader}>
          <Text style={styles.securityTitle}>🛡️ Verificación de Seguridad Local</Text>
          <View style={styles.activeDot} />
        </View>

        <View style={styles.securityRow}>
          <View style={styles.securityPill}>
            <Text style={styles.pillLabel}>Dispositivo:</Text>
            <Text style={styles.pillVal}>✓ Certificado ({deviceInfo.deviceId.slice(0, 10)}...)</Text>
          </View>
          <View style={styles.securityPill}>
            <Text style={styles.pillLabel}>Seguridad:</Text>
            <Text style={styles.pillVal}>✓ Cifrado E2E & Identidad JCE</Text>
          </View>
        </View>
      </View>

      {/* 4. Formulario de Destino & Origen */}
      <View style={styles.inputsCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Punto de Partida</Text>
          <TextInput
            style={styles.input}
            value={origin}
            onChangeText={setOrigin}
            placeholder="¿Dónde te recogemos?"
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destino</Text>
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="¿A dónde vas?"
            placeholderTextColor="#64748B"
          />
        </View>

        {/* Chips de Destinos Rápidos */}
        <Text style={styles.chipsLabel}>Destinos Frecuentes en Santo Domingo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {quickDestinations.map((q) => (
            <TouchableOpacity
              key={q.label}
              style={[
                styles.destinationChip,
                destination === q.address && styles.destinationChipActive,
              ]}
              onPress={() => setDestination(q.address)}
            >
              <Text
                style={[
                  styles.destinationChipText,
                  destination === q.address && styles.destinationChipTextActive,
                ]}
              >
                📍 {q.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MAPA EN VIVO DE SANTO DOMINGO: CoPilotRD MapView & GPS Radar */}
      <CoPilotClientMap
        originAddress={origin}
        destinationAddress={destination}
        category={selectedCategory}
        isExpanded={isMapExpanded}
        onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
      />

      {/* 5. Selección de Categoría de Vehículo */}
      <View style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>Tipo de Vehículo</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryOption,
                selectedCategory === cat.id && styles.categoryOptionActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory === cat.id && styles.categoryNameActive,
                ]}
              >
                {cat.name}
              </Text>
              <Text style={styles.categoryPrice}>RD$ {cat.price}</Text>
              <Text style={styles.categoryDesc}>{cat.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 6. Casilla: Chófer Favorito con Propina por Adelanto */}
      <View style={styles.favoriteCard}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.favoriteTitle}>⭐ Chófer Favorito</Text>
            <Text style={styles.favoriteSubtitle}>
              Añadir propina por adelanto para motivar a tu conductor favorito.
            </Text>
          </View>
          <Switch
            value={isFavoriteDriver}
            onValueChange={setIsFavoriteDriver}
            trackColor={{ false: '#334155', true: '#F59E0B' }}
            thumbColor={isFavoriteDriver ? '#FFFFFF' : '#94A3B8'}
          />
        </View>

        {isFavoriteDriver && (
          <View style={styles.tipSelectorRow}>
            <Text style={styles.tipLabel}>Monto de Propina por Adelanto:</Text>
            <View style={styles.chipsContainer}>
              {[50, 100, 150, 200].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.tipChip,
                    tipAmount === amount && styles.tipChipActive,
                  ]}
                  onPress={() => setTipAmount(amount)}
                >
                  <Text
                    style={[
                      styles.tipChipText,
                      tipAmount === amount && styles.tipChipTextActive,
                    ]}
                  >
                    +RD$ {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 7. Botón Principal: Confirmar y Despachar Viaje */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequestTrip}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Confirmar y Despachar Viaje Seguro</Text>
        )}
      </TouchableOpacity>

      {/* 8. Errores o Resultado */}
      {validationError && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>⚠️ Validación Denegada</Text>
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      )}

      {tripResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>¡Viaje Despachado con Éxito!</Text>
          <Text style={styles.resultText}>Código: {tripResult.code}</Text>
          <Text style={styles.resultText}>
            Tarifa Total: RD$ {tripResult.fare?.totalFare || '350'}
          </Text>
          
          <View style={styles.validationResultRow}>
            <Text style={styles.badgeTextGreen}>
              ✓ Dispositivo Validador: {tripResult.deviceValidation?.deviceId || 'Certificado'}
            </Text>
            <Text style={styles.badgeTextGreen}>
              ✓ Usuario Verificado: {clientName} ({clientPhone})
            </Text>
          </View>

          {tripResult.favoriteDriverAdvanceTip?.enabled && (
            <Text style={styles.badgeText}>
              ⭐ Propina adelantada de RD$ {tripResult.favoriteDriverAdvanceTip.amountDOP} garantizada 100% para el conductor.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scroll: { padding: 16, paddingBottom: 40 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeEmoji: {
    fontSize: 22,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandAccent: {
    color: '#94A3B8',
  },
  brandRegistered: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 2,
    fontWeight: '600',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  localPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  localDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  localPillText: {
    color: '#6EE7B7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 14,
    marginBottom: 14,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  verifiedTag: {
    backgroundColor: '#047857',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ECFDF5',
  },
  userSubText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  userPhoneText: {
    fontSize: 11,
    color: '#60A5FA',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  authNoticeBanner: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  authNoticeText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '600',
  },
  securityBox: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  securityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  securityTitle: { fontSize: 12, fontWeight: 'bold', color: '#60A5FA' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  securityRow: { flexDirection: 'column', gap: 4 },
  securityPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  pillVal: { fontSize: 11, color: '#34D399', fontWeight: 'bold' },
  inputsCard: {
    backgroundColor: '#0E1322',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 14,
  },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 6 },
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  destinationChip: {
    backgroundColor: '#1A2338',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3756',
    marginRight: 8,
  },
  destinationChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  destinationChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  destinationChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  categoryCard: {
    backgroundColor: '#0E1322',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    backgroundColor: '#182033',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#263352',
    alignItems: 'center',
  },
  categoryOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E2E4F',
  },
  categoryName: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryNameActive: {
    color: '#60A5FA',
  },
  categoryPrice: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  categoryDesc: {
    color: '#64748B',
    fontSize: 9,
    textAlign: 'center',
  },
  favoriteCard: {
    backgroundColor: '#1E2235',
    borderColor: '#D97706',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favoriteTitle: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold' },
  favoriteSubtitle: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  tipSelectorRow: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  tipLabel: { color: '#CBD5E1', fontSize: 12, marginBottom: 8 },
  chipsContainer: { flexDirection: 'row', gap: 8 },
  tipChip: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  tipChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  tipChipText: { color: '#CBD5E1', fontSize: 12, fontWeight: '600' },
  tipChipTextActive: { color: '#0F172A', fontWeight: 'bold' },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  errorCard: {
    backgroundColor: '#7F1D1D',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  errorTitle: { color: '#FCA5A5', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  errorText: { color: '#FEE2E2', fontSize: 12 },
  resultCard: {
    backgroundColor: '#064E3B',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#059669',
  },
  resultTitle: { color: '#34D399', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  resultText: { color: '#ECFDF5', fontSize: 13, marginBottom: 4 },
  validationResultRow: {
    backgroundColor: '#042F2E',
    padding: 8,
    borderRadius: 8,
    marginVertical: 6,
  },
  badgeTextGreen: { color: '#A7F3D0', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  badgeText: { color: '#FDE68A', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
});
