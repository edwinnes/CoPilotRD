import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { requestTrip } from '../services/mobileApi';
import CoPilotClientMap from '../components/CoPilotClientMap';
import ClientBottomNav from '../components/ClientBottomNav';
import SettingsScreen from './SettingsScreen';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function CardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonBlock, { width: '40%', height: 16, opacity }]} />
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}>
        <Animated.View style={[styles.skeletonBlock, { flex: 1, height: 70, borderRadius: 12, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { flex: 1, height: 70, borderRadius: 12, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { flex: 1, height: 70, borderRadius: 12, opacity }]} />
      </View>
    </View>
  );
}

export default function ClientMainDashboard({ onOpenSduiConfig }) {
  const { user, logout } = useAuth();
  const gps = useCurrentLocation();

  const [activeModule, setActiveModule] = useState('HOME');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Clásico');
  const [isFavoriteDriver, setIsFavoriteDriver] = useState(false);
  const [tipAmount, setTipAmount] = useState(100);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tripResult, setTripResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const clientName = user?.fullName || 'Usuario';
  const clientEmail = user?.email || 'Correo no disponible';
  const clientPhone = user?.phone || 'Teléfono no disponible';

  const quickDestinations = [
    { label: 'Aeropuerto AILA', address: 'Aeropuerto Int. Las Américas (AILA)' },
    { label: 'BlueMall', address: 'BlueMall Santo Domingo, Av. Winston Churchill' },
    { label: 'Zona Colonial', address: 'Calle Las Damas, Zona Colonial' },
    { label: 'Bella Vista Mall', address: 'Bella Vista Mall, Av. Sarasota' },
  ];

  const categories = [
    { id: 'Clásico', name: 'Clásico', desc: 'Económico y rápido' },
    { id: 'Estándar', name: 'Estándar', desc: 'Confort con A/C' },
    { id: 'Premium', name: 'Premium', desc: 'Sedán Ejecutivo' },
    { id: 'Elite', name: 'Elite', desc: 'Vehículo de lujo' },
  ];

  const handleUseCurrentLocation = async () => {
    const coords = await gps.request();
    if (coords) setOrigin(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
    else Alert.alert('GPS', 'No se pudo obtener tu ubicación. Comprueba los permisos y el GPS.');
  };

  const handleAddStop = () => {
    if (stops.length >= 2) {
      Alert.alert('Límite de paradas', 'Máximo 2 paradas intermedias.');
      return;
    }
    setStops([...stops, '']);
  };

  const handleUpdateStop = (text, index) => {
    const updated = [...stops];
    updated[index] = text;
    setStops(updated);
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleProceedToCategories = () => {
    if (!origin || !destination) {
      Alert.alert('Ingresa la ruta', 'Debes especificar punto de partida y destino.');
      return;
    }
    Alert.alert('Cotización no disponible', 'Falta integrar tarifas y despacho verificados del servidor. No se ha solicitado un viaje.');
  };

  const handleRequestTrip = async () => {
    if (loading) return;
    setLoading(true);
    setValidationError(null);
    setTripResult(null);

    try {
      const response = await requestTrip({
        originAddress: origin,
        destinationAddress: destination,
        stops,
        category: selectedCategory,
        isFavoriteDriver,
        favoriteTipDOP: isFavoriteDriver ? tipAmount : 0,
      });

      if (response?.success && response?.trip) {
        setTripResult(response.trip);
      } else {
        setValidationError(response?.message || 'Error en validación de despacho.');
      }
    } catch (err) {
      setValidationError('No se pudo despachar el viaje. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Deseas salir y regresar al inicio de sesión SDUI?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: async () => await logout() },
      ]
    );
  };

  if (activeModule === 'SETTINGS' || activeModule === 'SECURITY') {
    return <SettingsScreen onClose={() => setActiveModule('HOME')} />;
  }

  return (
    <View style={styles.mainContainer}>
      {/* 1. MÓDULO INICIO: MAPA Y TARJETA DE VIAJE */}
      {activeModule === 'HOME' && (
        <View style={styles.homeTabContainer}>
          {/* Capa de Mapa en Fondo Absoluto con dimensiones explícitas */}
          <View style={styles.mapBackgroundContainer}>
            <CoPilotClientMap isExpanded={true} />
          </View>

          {/* Tarjeta Flotante Bottom Sheet */}
          <View style={[styles.bottomSheetCard, isCardCollapsed && styles.bottomSheetCardCollapsed]}>
            <TouchableOpacity
              style={styles.dragHandleContainer}
              onPress={() => setIsCardCollapsed(!isCardCollapsed)}
            >
              <View style={styles.dragHandle} />
            </TouchableOpacity>

            {!isCardCollapsed && (
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cardContent}
              >
                {/* Ruta Unificada */}
                <View style={styles.routeUnifiedCard}>
                  <View style={styles.inputRowContainer}>
                    <Text style={styles.inputIconGreen}>🟢</Text>
                    <TextInput
                      style={styles.routeInput}
                      value={origin}
                      onChangeText={setOrigin}
                      placeholder="¿Dónde te recogemos?"
                      placeholderTextColor="#64748B"
                    />
                    <TouchableOpacity style={styles.gpsTouchBtn} onPress={handleUseCurrentLocation}>
                      <Text style={styles.gpsTouchText}>🎯 GPS</Text>
                    </TouchableOpacity>
                  </View>

                  {stops.map((stopText, idx) => (
                    <View key={idx} style={styles.inputRowContainer}>
                      <Text style={styles.inputIconYellow}>🟡</Text>
                      <TextInput
                        style={styles.routeInput}
                        value={stopText}
                        onChangeText={(txt) => handleUpdateStop(txt, idx)}
                        placeholder={`Parada ${idx + 1}`}
                        placeholderTextColor="#64748B"
                      />
                      <TouchableOpacity onPress={() => handleRemoveStop(idx)}>
                        <Text style={styles.removeStopText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <View style={styles.connectorLine} />

                  <View style={styles.inputRowContainer}>
                    <Text style={styles.inputIconRed}>🔴</Text>
                    <TextInput
                      style={styles.routeInput}
                      value={destination}
                      onChangeText={setDestination}
                      placeholder="¿A dónde te diriges?"
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <TouchableOpacity style={styles.addStopBtn} onPress={handleAddStop}>
                    <Text style={styles.addStopBtnText}>+ Agregar parada</Text>
                  </TouchableOpacity>
                </View>

                {currentStep === 1 && (
                  <>
                    <Text style={styles.chipsLabel}>Sugerencias en Santo Domingo:</Text>
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

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleProceedToCategories}>
                      <Text style={styles.primaryBtnText}>Ver Categorías y Tarifas →</Text>
                    </TouchableOpacity>
                  </>
                )}

                {currentStep >= 2 && (
                  <View style={styles.stepSection}>
                    {calculatingFare ? (
                      <CardSkeleton />
                    ) : (
                      <>
                        <View style={styles.sectionHeaderRow}>
                          <Text style={styles.sectionTitle}>Categoría de Vehículo</Text>
                          {currentStep > 2 && (
                            <TouchableOpacity onPress={() => setCurrentStep(2)}>
                              <Text style={styles.changeStepText}>Cambiar</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                          {categories.map((cat) => (
                            <TouchableOpacity
                              key={cat.id}
                              style={[
                                styles.categoryOption,
                                selectedCategory === cat.id && styles.categoryOptionActive,
                              ]}
                              onPress={() => {
                                setSelectedCategory(cat.id);
                                if (currentStep === 2) setCurrentStep(3);
                              }}
                            >
                              <Text
                                style={[
                                  styles.categoryName,
                                  selectedCategory === cat.id && styles.categoryNameActive,
                                ]}
                              >
                                {cat.name}
                              </Text>
                              <Text style={styles.categoryPrice}>Tarifa no disponible</Text>
                              <Text style={styles.categoryDesc}>{cat.desc}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </>
                    )}
                  </View>
                )}

                {currentStep === 3 && (
                  <View style={styles.stepSection}>
                    <View style={styles.favoriteCard}>
                      <View style={styles.switchRow}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.favoriteTitle}>⭐ Chófer Favorito</Text>
                          <Text style={styles.favoriteSubtitle}>
                            Propina adelantada para asignación prioritaria.
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
                          <Text style={styles.tipTitle}>Propina por Adelantado:</Text>
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

                    <TouchableOpacity
                      style={[styles.confirmBtn, loading && styles.btnDisabled]}
                      onPress={handleRequestTrip}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      {loading ? (
                        <View style={styles.btnLoadingRow}>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text style={styles.confirmBtnText}>Despachando Viaje...</Text>
                        </View>
                      ) : (
                        <Text style={styles.confirmBtnText}>Confirmar y Solicitar Viaje Seguro</Text>
                      )}
                    </TouchableOpacity>

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
                          Tarifa: RD$ {tripResult.fare?.totalFare ?? 'No disponible'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* 2. MÓDULO NOTIFICACIONES */}
      {activeModule === 'NOTIFICATIONS' && (
        <ScrollView style={styles.moduleContainer} contentContainerStyle={styles.moduleContent}>
          <Text style={styles.moduleHeaderTitle}>🔔 Notificaciones</Text>
          <Text style={styles.notifDesc}>No hay un servicio de notificaciones integrado. No se muestran mensajes ficticios.</Text>
        </ScrollView>
      )}

      {/* 3. MÓDULO BILLETERA */}
      {activeModule === 'WALLET' && (
        <ScrollView style={styles.moduleContainer} contentContainerStyle={styles.moduleContent}>
          <Text style={styles.moduleHeaderTitle}>💳 Billetera & Banco KM</Text>
          <Text style={styles.notifDesc}>Saldo y métodos de pago no disponibles. Falta integrar un servicio financiero verificado. Los pagos y canjes están deshabilitados.</Text>
        </ScrollView>
      )}

      {/* 4. MÓDULO PERFIL */}
      {activeModule === 'PROFILE' && (
        <ScrollView style={styles.moduleContainer} contentContainerStyle={styles.moduleContent}>
          <Text style={styles.moduleHeaderTitle}>👤 Mi Perfil</Text>
          <View style={styles.userProfileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{clientName.charAt(0)}</Text>
            </View>
            <Text style={styles.profileName}>{clientName}</Text>
            <Text style={styles.profileEmail}>{clientEmail}</Text>
            <Text style={styles.profilePhone}>{clientPhone}</Text>
            <View style={styles.verifiedBadgeRow}>
              <Text style={styles.verifiedBadgeText}>Estado de verificación no disponible</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButtonProfile} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {['TRIPS_HISTORY', 'KM_CLUB', 'SUPPORT'].includes(activeModule) && (
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleHeaderTitle}>{activeModule === 'SUPPORT' ? 'Soporte técnico' : 'Servicio no disponible'}</Text>
          <Text style={styles.notifDesc}>No hay integración verificada para este servicio.</Text>
          {activeModule === 'SUPPORT' && <TouchableOpacity style={styles.primaryBtn} onPress={async () => {
            const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || '';
            if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
              Alert.alert('Soporte no disponible', 'No hay un canal de soporte configurado.'); return;
            }
            try { await Linking.openURL(`mailto:${email}`); }
            catch { Alert.alert('Soporte', 'No se pudo abrir el correo.'); }
          }}><Text style={styles.primaryBtnText}>Abrir correo de soporte</Text></TouchableOpacity>}
        </View>
      )}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="SOS: abrir el marcador para llamar al 911"
        style={{ position: 'absolute', top: 76, right: 16, padding: 12, backgroundColor: '#B91C1C', zIndex: 91 }}
        onPress={() => Alert.alert('Emergencia', 'Se abrirá el marcador para llamar al 911. No se envía una alerta a CoPilotRD ni tu ubicación.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir marcador', onPress: () => { void Linking.openURL('tel:911').catch(() => Alert.alert('Emergencia', 'No se pudo abrir el marcador. Llama al 911 manualmente.')); } },
        ])}><Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>SOS · 911</Text></TouchableOpacity>
      {/* BARRA SUPERIOR E INFERIOR INTEGRADAS */}
      <ClientBottomNav activeTab={activeModule} onChangeTab={setActiveModule} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#0A0E1A' 
  },
  homeTabContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0A0E1A'
  },
  mapBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1,
  },
  bottomSheetCard: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.60,
    backgroundColor: '#0E121B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1A2133',
    zIndex: 10,
    paddingBottom: 15,
  },
  bottomSheetCardCollapsed: { maxHeight: 42 },
  dragHandleContainer: { width: '100%', paddingVertical: 10, alignItems: 'center' },
  dragHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#334155' },
  cardContent: { paddingHorizontal: 16, paddingBottom: 15 },
  routeUnifiedCard: {
    backgroundColor: '#151A27',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222B40',
    marginBottom: 12,
  },
  inputRowContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  inputIconGreen: { fontSize: 12, marginRight: 8 },
  inputIconYellow: { fontSize: 12, marginRight: 8 },
  inputIconRed: { fontSize: 12, marginRight: 8 },
  routeInput: { flex: 1, color: '#FFFFFF', fontSize: 13, height: 38 },
  gpsTouchBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gpsTouchText: { color: '#38BDF8', fontSize: 10, fontWeight: '700' },
  removeStopText: { color: '#EF4444', fontSize: 14, paddingHorizontal: 6 },
  connectorLine: {
    width: 2,
    height: 12,
    backgroundColor: '#334155',
    marginLeft: 13,
    marginVertical: -2,
  },
  addStopBtn: { marginTop: 6, alignSelf: 'flex-start' },
  addStopBtnText: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },
  chipsLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  chipsScroll: { flexDirection: 'row', marginBottom: 12 },
  destinationChip: {
    backgroundColor: '#1A2338',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  destinationChipActive: { backgroundColor: '#2563EB' },
  destinationChipText: { color: '#94A3B8', fontSize: 11 },
  destinationChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  primaryBtn: {
    backgroundColor: '#2563EB',
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  stepSection: { marginTop: 8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#F8FAFC' },
  changeStepText: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },
  categoryScroll: { flexDirection: 'row', marginBottom: 12 },
  categoryOption: {
    width: 110,
    backgroundColor: '#182033',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#263352',
    marginRight: 8,
    alignItems: 'center',
  },
  categoryOptionActive: { borderColor: '#3B82F6', backgroundColor: '#1E2E4F' },
  categoryName: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  categoryNameActive: { color: '#60A5FA' },
  categoryPrice: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginVertical: 2 },
  categoryDesc: { color: '#64748B', fontSize: 8, textAlign: 'center' },
  favoriteCard: {
    backgroundColor: '#1E2235',
    borderColor: '#D97706',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favoriteTitle: { color: '#FBBF24', fontSize: 12, fontWeight: 'bold' },
  favoriteSubtitle: { color: '#94A3B8', fontSize: 10 },
  tipSelectorRow: { marginTop: 8 },
  tipTitle: { color: '#CBD5E1', fontSize: 11, marginBottom: 6 },
  chipsContainer: { flexDirection: 'row', gap: 6 },
  tipChip: { backgroundColor: '#0F172A', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 14 },
  tipChipActive: { backgroundColor: '#F59E0B' },
  tipChipText: { color: '#CBD5E1', fontSize: 11 },
  tipChipTextActive: { color: '#0F172A', fontWeight: 'bold' },
  confirmBtn: {
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  btnLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  errorCard: { backgroundColor: '#7F1D1D', borderRadius: 10, padding: 10, marginTop: 10 },
  errorTitle: { color: '#FCA5A5', fontSize: 12, fontWeight: 'bold' },
  errorText: { color: '#FEE2E2', fontSize: 11 },
  resultCard: { backgroundColor: '#064E3B', borderRadius: 10, padding: 10, marginTop: 10 },
  resultTitle: { color: '#34D399', fontSize: 13, fontWeight: 'bold' },
  resultText: { color: '#ECFDF5', fontSize: 11 },
  skeletonContainer: { paddingVertical: 8 },
  skeletonBlock: { backgroundColor: '#1E293B', borderRadius: 8 },
  moduleContainer: { flex: 1, backgroundColor: '#0B0F19', paddingTop: 60 },
  moduleContent: { padding: 20, paddingBottom: 90 },
  moduleHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, marginTop: 20 },
  notifCard: { backgroundColor: '#111827', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1F2937' },
  notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  notifDesc: { fontSize: 12, color: '#94A3B8', marginBottom: 6 },
  notifTime: { fontSize: 10, color: '#64748B' },
  kmBankCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center', marginBottom: 16 },
  kmBankTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  kmBankSubtitle: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginBottom: 12 },
  kmBalanceBox: { backgroundColor: '#0F172A', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center' },
  kmBalanceNumber: { fontSize: 30, fontWeight: 'bold', color: '#38BDF8' },
  kmBalanceUnit: { fontSize: 9, color: '#94A3B8', fontWeight: 'bold' },
  walletActionCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  walletItem: { color: '#E2E8F0', fontSize: 13, marginVertical: 8 },
  addPaymentBtn: { marginTop: 10, backgroundColor: '#1E293B', padding: 10, borderRadius: 10, alignItems: 'center' },
  addPaymentText: { color: '#38BDF8', fontSize: 12, fontWeight: 'bold' },
  userProfileCard: { backgroundColor: '#111827', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937', marginBottom: 20 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  profileAvatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: '#94A3B8', marginBottom: 2 },
  profilePhone: { fontSize: 13, color: '#60A5FA', fontWeight: '600', marginBottom: 12 },
  verifiedBadgeRow: { backgroundColor: '#047857', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  verifiedBadgeText: { color: '#ECFDF5', fontSize: 11, fontWeight: 'bold' },
  logoutButtonProfile: { backgroundColor: '#7F1D1D', padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  logoutButtonText: { color: '#FEE2E2', fontSize: 14, fontWeight: 'bold' },
});
