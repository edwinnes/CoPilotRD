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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
// requestTrip pendiente de integración real con el backend.
import CoPilotClientMap from '../components/CoPilotClientMap';
import NativeTripCard from '../components/NativeTripCard';
import { adaptConfirmedTrip } from '../utils/tripTrackingAdapter';
import ClientBottomNav from '../components/ClientBottomNav';
import ChromeSurface from '../components/ChromeSurface';
import { CarFront, Package, HeartPulse } from 'lucide-react-native';

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
  const { preference, changeTheme, colors } = useAppTheme();

  const [activeModule, setActiveModule] = useState('HOME');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Clásico');
  const [isFavoriteDriver, setIsFavoriteDriver] = useState(false);
  const [tipAmount, setTipAmount] = useState(100);
  const [currentStep, setCurrentStep] = useState(1);
  const stepTransitionOpacity = useRef(new Animated.Value(1)).current;
  const stepTransitionOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    stepTransitionOpacity.setValue(0);
    stepTransitionOffset.setValue(12);

    const animation = Animated.parallel([
      Animated.timing(stepTransitionOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(stepTransitionOffset, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [currentStep, stepTransitionOpacity, stepTransitionOffset]);
  const [activeService, setActiveService] = useState('TRIP');
  const [isCardCollapsed, setIsCardCollapsed] = useState(true);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tripResult, setTripResult] = useState(null);
  const [isTrackingExpanded, setIsTrackingExpanded] = useState(true);
  const confirmedTrip = adaptConfirmedTrip(tripResult);
  const [validationError, setValidationError] = useState(null);

  const clientName = user?.fullName || 'Pasajero';
  const clientEmail = user?.email || 'No disponible';
  const clientPhone = user?.phone || 'No disponible';
  const kmBalance = user?.kmBank ?? null;

  const quickDestinations = [
    { label: 'Aeropuerto AILA', address: 'Aeropuerto Int. Las Américas (AILA)' },
    { label: 'BlueMall', address: 'BlueMall Santo Domingo, Av. Winston Churchill' },
    { label: 'Zona Colonial', address: 'Calle Las Damas, Zona Colonial' },
    { label: 'Bella Vista Mall', address: 'Bella Vista Mall, Av. Sarasota' },
  ];

  const categories = [
    { id: 'Clásico', name: 'Clásico', price: 290, desc: 'Económico y rápido' },
    { id: 'Estándar', name: 'Estándar', price: 350, desc: 'Confort con A/C' },
    { id: 'Premium', name: 'Premium', price: 480, desc: 'Sedán Ejecutivo' },
    { id: 'Elite', name: 'Elite', price: 650, desc: 'Vehículo de lujo' },
  ];

  const handleUseCurrentLocation = () => {
    setOrigin('Mi Ubicación Actual (GPS Centralizado)');
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
    setCalculatingFare(true);
    setCurrentStep(2);
    setTimeout(() => {
      setCalculatingFare(false);
    }, 800);
  };

  const handleRequestTrip = async () => {
    Alert.alert(
      'Servicio no disponible',
      'El despacho de viajes estará disponible cuando se valide la integración real con el backend.'
    );
    return;

    setLoading(true);
    setValidationError(null);
    setTripResult(null);

    try {
      const response = await requestTrip({
        originAddress: origin,
        destinationAddress: destination,
        stops,
        category: selectedCategory,
        distanceKm: 28.5,
        durationMinutes: 35,
        isFavoriteDriver,
        favoriteTipDOP: isFavoriteDriver ? tipAmount : 0,
        clientId: user?.id || 'cli-01',
        clientName,
        clientPhone,
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

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* 1. MÓDULO INICIO: MAPA Y TARJETA DE VIAJE */}
      {activeModule === 'HOME' && (
        <View style={styles.homeTabContainer}>
          {/* Mapa GPS real: tarjeta compacta o pantalla completa */}
          <View
            style={[
              styles.mapBackgroundContainer,
              isMapFullscreen && styles.mapFullscreenContainer,
            ]}
          >
            {!isMapFullscreen && (
              <View style={styles.mapCardHeading}>
                <Text style={styles.mapCardTitle}>Mapa GPS</Text>
                <Text style={styles.mapCardStatus}>Ubicación en vivo</Text>
              </View>
            )}

            <View style={styles.mapViewport}>
              <CoPilotClientMap isExpanded={isMapFullscreen} />
            </View>

            <TouchableOpacity
              style={styles.mapExpandButton}
              onPress={() => setIsMapFullscreen(value => !value)}
              accessibilityRole="button"
              accessibilityLabel={
                isMapFullscreen
                  ? 'Restaurar mapa'
                  : 'Ampliar mapa a pantalla completa'
              }
              activeOpacity={0.85}
            >
              <Text style={styles.mapExpandButtonText}>
                {isMapFullscreen ? '↙ Restaurar mapa' : '⛶ Ampliar mapa'}
              </Text>
            </TouchableOpacity>
          </View>

          {!isMapFullscreen && (
            <View style={styles.recentTripsContainer}>
              <Text style={styles.recentTripsTitle}>
                Viajes recientes
              </Text>
              <Text style={styles.recentTripsEmpty}>
                Tus viajes registrados aparecerán aquí.
              </Text>
            </View>
          )}

          {!isMapFullscreen && confirmedTrip && (
            <View style={styles.trackingOverlay}>
              <NativeTripCard
                trip={confirmedTrip}
                isExpanded={isTrackingExpanded}
                onToggleExpand={() =>
                  setIsTrackingExpanded(previous => !previous)
                }
              />
            </View>
          )}

          {/* Búsqueda flotante: comparte el destino con la consola */}

          <View
            style={[
              styles.serviceSelector,
              isMapFullscreen && styles.hiddenWhileFullscreen,
            ]}
            pointerEvents={isMapFullscreen ? 'none' : 'auto'}
          >
            {[
              { id: 'TRIP', label: 'Viajes', Icon: CarFront },
              { id: 'PACKAGE', label: 'Paquetes', Icon: Package },
              { id: 'VEH', label: 'VEH', Icon: HeartPulse },
            ].map(service => {
              const selected = activeService === service.id;

              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceTouch}
                  onPress={() => {
                    setActiveService(service.id);
                    setIsCardCollapsed(true);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={service.label}
                  activeOpacity={0.85}
                >
                  <ChromeSurface
                    radius={14}
                    variant={selected ? 'input' : 'secondary'}
                    style={styles.serviceChrome}
                    contentStyle={[
                      styles.serviceChromeContent,
                      selected && styles.serviceSelected,
                    ]}
                  >
                    <service.Icon
                      size={22}
                      strokeWidth={selected ? 2.3 : 1.9}
                      color={selected ? '#F5F7FA' : '#C2CBD5'}
                    />
                    <Text style={[
                      styles.serviceLabel,
                      selected && styles.serviceTextSelected,
                    ]}>
                      {service.label}
                    </Text>
                  </ChromeSurface>
                </TouchableOpacity>
              );
            })}
          </View>
          {!isMapFullscreen && activeService !== 'TRIP' && (
            <View style={{
              position: 'absolute',
              top: 186,
              left: 16,
              right: 16,
              zIndex: 18,
              backgroundColor: '#151A20',
              borderWidth: 1,
              borderColor: '#69727E',
              borderRadius: 12,
              padding: 12,
            }}>
              <Text style={{ color: '#EEF0F3', textAlign: 'center', fontWeight: '600' }}>
                {activeService === 'PACKAGE'
                  ? 'Paquetes: pendiente de integración SDUI'
                  : 'VEH: transporte asistido no urgente, pendiente de integración SDUI'}
              </Text>
            </View>
          )}
          {!isMapFullscreen && activeService === 'TRIP' && !confirmedTrip && isCardCollapsed && (
            <TouchableOpacity
              style={styles.floatingDestination}
              onPress={() => {
                setCurrentStep(1);
                setIsCardCollapsed(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Ingresar destino del viaje"
              activeOpacity={0.85}
            >
              <Text style={styles.floatingDestinationIcon}>⌕</Text>
              <Text
                style={styles.floatingDestinationText}
                numberOfLines={1}
              >
                {destination || '¿A dónde te diriges?'}
              </Text>
              <Text style={styles.floatingDestinationArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Tarjeta Flotante Bottom Sheet */}
          {false && !isMapFullscreen && activeService === 'TRIP' && !confirmedTrip && (
          <View style={[styles.bottomSheetCard, isCardCollapsed && styles.bottomSheetCardCollapsed]}>
            <TouchableOpacity
              style={styles.dragHandleContainer}
              onPress={() => setIsCardCollapsed(!isCardCollapsed)}
            >
              <View style={styles.dragHandle} />
              {isCardCollapsed && (
                <Text style={styles.collapsedSheetTitle}>
                  Planificar viaje  ·  Toca para configurar tu ruta
                </Text>
              )}
            </TouchableOpacity>

            {!isCardCollapsed && (
              <Animated.View
                style={{
                  flex: 1,
                  opacity: stepTransitionOpacity,
                  transform: [{ translateY: stepTransitionOffset }],
                }}
              >
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

                        {currentStep === 3 ? (
                          <TouchableOpacity
                            className="rounded-xl border border-zinc-600 bg-zinc-900 p-3"
                            onPress={() => setCurrentStep(2)}
                            accessibilityRole="button"
                            accessibilityLabel="Cambiar categoría de vehículo"
                          >
                            <Text className="text-xs text-zinc-400">
                              Vehículo seleccionado
                            </Text>
                            <Text className="mt-1 text-base font-semibold text-white">
                              {categories.find((cat) => cat.id === selectedCategory)?.name || selectedCategory}
                            </Text>
                            <Text className="mt-1 text-xs text-zinc-400">
                              Toca para cambiar de categoría
                            </Text>
                          </TouchableOpacity>
                        ) : (
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
                              <Text style={styles.categoryPrice}>RD$ {cat.price}</Text>
                              <Text style={styles.categoryDesc}>{cat.desc}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        )}
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

                    {tripResult && !confirmedTrip && (
                      <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>
                          Solicitud recibida
                        </Text>
                        <Text style={styles.resultText}>
                          Esperando confirmación del estado del viaje.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
              </Animated.View>
            )}
          </View>
          )}
        </View>
      )}

      {/* 2. MÓDULO NOTIFICACIONES */}
      {activeModule === 'NOTIFICATIONS' && (
        <ScrollView style={styles.moduleContainer} contentContainerStyle={styles.moduleContent}>
          <Text style={styles.moduleHeaderTitle}>🔔 Notificaciones</Text>
          <View style={styles.notifCard}>
            <Text style={styles.notifTitle}>¡Bienvenido a CoPilotRD!</Text>
            <Text style={styles.notifDesc}>Tu cuenta ha sido vinculada exitosamente con el sistema JCE y Cloud Run.</Text>
            <Text style={styles.notifTime}>Hace 5 minutos</Text>
          </View>
          <View style={styles.notifCard}>
            <Text style={styles.notifTitle}>Tarifa Preferencial Activa</Text>
            <Text style={styles.notifDesc}>Disfrutas de un descuento especial por ser usuario fundador.</Text>
            <Text style={styles.notifTime}>Ayer</Text>
          </View>
        </ScrollView>
      )}

      {/* 3. MÓDULO BILLETERA */}
      {activeModule === 'WALLET' && (
        <ScrollView style={styles.moduleContainer} contentContainerStyle={styles.moduleContent}>
          <Text style={styles.moduleHeaderTitle}>💳 Billetera & Banco KM</Text>
          <View style={styles.kmBankCard}>
            <Text style={styles.kmBankTitle}>Banco de Kilómetros</Text>
            <Text style={styles.kmBankSubtitle}>Acumulas 1 KM por cada RD$ 100 en viajes.</Text>
            <View style={styles.kmBalanceBox}>
              <Text style={styles.kmBalanceNumber}>{kmBalance}</Text>
              <Text style={styles.kmBalanceUnit}>KM DISPONIBLES</Text>
            </View>
          </View>
          <View style={styles.walletActionCard}>
            <Text style={styles.sectionTitle}>Métodos de Pago</Text>
            <Text style={styles.walletItem}>💳 •••• 4092 (Predeterminada)</Text>
            <TouchableOpacity style={styles.addPaymentBtn}>
              <Text style={styles.addPaymentText}>+ Agregar Tarjeta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* 4. MÓDULO PERFIL */}
      {activeModule === 'PROFILE' && (
        <ScrollView style={[styles.moduleContainer, { backgroundColor: colors.background }]} contentContainerStyle={styles.moduleContent}>
          <Text style={[styles.moduleHeaderTitle, { color: colors.text }]}>👤 Mi Perfil</Text>
          <View style={[styles.userProfileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{clientName.charAt(0)}</Text>
            </View>
            <Text style={[styles.profileName, { color: colors.text }]}>{clientName}</Text>
            <Text style={[styles.profileEmail, { color: colors.muted }]}>{clientEmail}</Text>
            <Text style={[styles.profilePhone, { color: colors.primary }]}>{clientPhone}</Text>
            <View style={styles.verifiedBadgeRow}>
              <Text style={styles.verifiedBadgeText}>✓ Identidad Verificada por JCE</Text>
            </View>
          </View>

          <View style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}>
            <Text style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 6,
            }}>
              Apariencia
            </Text>
            <Text style={{
              color: colors.muted,
              fontSize: 12,
              marginBottom: 14,
            }}>
              Selecciona cómo deseas visualizar CoPilotRD.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { key: 'light', label: '☀️ Claro' },
                { key: 'dark', label: '🌙 Oscuro' },
                { key: 'system', label: '📱 Sistema' },
              ].map((option) => {
                const selected = preference === option.key;

                return (
                  <TouchableOpacity
                    key={option.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => changeTheme(option.key)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 4,
                      alignItems: 'center',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary : colors.background,
                    }}
                  >
                    <Text style={{
                      color: selected ? '#FFFFFF' : colors.text,
                      fontSize: 11,
                      fontWeight: selected ? 'bold' : '500',
                    }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButtonProfile} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* BARRA SUPERIOR E INFERIOR INTEGRADAS */}
      <ClientBottomNav activeTab={activeModule} onChangeTab={setActiveModule} />
    </View>
  );
}

const styles = StyleSheet.create({
  trackingOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 20,
    maxHeight: SCREEN_HEIGHT * 0.72,
  },
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
    top: 254,
    left: 16,
    right: 16,
    height: 238,
    backgroundColor: '#101318',
    borderWidth: 1,
    borderColor: '#77828E',
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 2,
    elevation: 0,
  },
  mapFullscreenContainer: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 72,
    height: undefined,
    borderWidth: 0,
    borderRadius: 0,
    zIndex: 60,
    elevation: 15,
  },
  mapCardHeading: {
    height: 34,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapCardTitle: {
    color: '#F1F3F5',
    fontSize: 13,
    fontWeight: '800',
  },
  mapCardStatus: {
    color: '#AEB7C4',
    fontSize: 10,
  },
  mapViewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#181B1F',
  },
  mapExpandButton: {
    height: 36,
    backgroundColor: '#1B2027',
    borderTopWidth: 1,
    borderTopColor: '#66717D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapExpandButtonText: {
    color: '#E6EBF0',
    fontSize: 12,
    fontWeight: '700',
  },
  recentTripsContainer: {
    position: 'absolute',
    top: 504,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#59636F',
    backgroundColor: '#11151A',
    zIndex: 3,
  },
  recentTripsTitle: {
    color: '#F0F2F5',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  recentTripsEmpty: {
    color: '#AEB7C4',
    fontSize: 12,
  },
  hiddenWhileFullscreen: {
    opacity: 0,
  },
  serviceSelector: {
    position: 'absolute',
    top: 102,
    left: 16,
    right: 16,
    zIndex: 18,
    flexDirection: 'row',
    gap: 8,
  },
  serviceTouch: {
    flex: 1,
    height: 76,
  },
  serviceChrome: {
    flex: 1,
  },
  serviceChromeContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#181C22',
  },
  serviceSelected: {
    backgroundColor: '#303338',
  },
  serviceIcon: {
    color: '#AEB7C4',
    fontSize: 15,
    fontWeight: '800',
  },
  serviceLabel: {
    color: '#E3E8EE',
    fontSize: 13,
    fontWeight: '700',
  },
  serviceTextSelected: {
    color: '#F5F7FA',
  },
  collapsedSheetTitle: {
    color: '#D8DCE1',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  floatingDestination: {
    position: 'absolute',
    top: 186,
    left: 16,
    right: 16,
    zIndex: 15,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#101318',
    borderColor: '#AEB7C4',
    borderWidth: 1,
    borderRadius: 18,
    elevation: 8,
  },
  floatingDestinationIcon: {
    color: '#D5DCE5',
    fontSize: 28,
    marginRight: 12,
  },
  floatingDestinationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  floatingDestinationArrow: {
    color: '#D5DCE5',
    fontSize: 28,
    marginLeft: 8,
  },
  bottomSheetCard: {
    position: 'absolute',
    bottom: 72,
    left: 12,
    right: 12,
    maxHeight: SCREEN_HEIGHT * 0.60,
    backgroundColor: '#080A0D',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: '#535A63',
    zIndex: 30,
    elevation: 16,
    paddingBottom: 15,
  },
  bottomSheetCardCollapsed: {
    height: 54,
    maxHeight: 54,
    paddingBottom: 0,
  },
  dragHandleContainer: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
  },
  dragHandle: { width: 34, height: 3, borderRadius: 3, backgroundColor: '#858C94' },
  cardContent: { paddingHorizontal: 16, paddingBottom: 15 },
  routeUnifiedCard: {
    backgroundColor: '#14181E',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8793A3',
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
  gpsTouchText: { color: '#D5DCE5', fontSize: 10, fontWeight: '700' },
  removeStopText: { color: '#EF4444', fontSize: 14, paddingHorizontal: 6 },
  connectorLine: {
    width: 2,
    height: 12,
    backgroundColor: '#334155',
    marginLeft: 13,
    marginVertical: -2,
  },
  addStopBtn: { marginTop: 6, alignSelf: 'flex-start' },
  addStopBtnText: { color: '#D5DCE5', fontSize: 11, fontWeight: '600' },
  chipsLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  chipsScroll: { flexDirection: 'row', marginBottom: 12 },
  destinationChip: {
    backgroundColor: '#20252D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  destinationChipActive: { backgroundColor: '#AEB7C4' },
  destinationChipText: { color: '#94A3B8', fontSize: 11 },
  destinationChipTextActive: { color: '#101318', fontWeight: 'bold' },
  primaryBtn: {
    backgroundColor: '#C9D1DA',
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#101318', fontSize: 14, fontWeight: 'bold' },
  stepSection: { marginTop: 8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#F8FAFC' },
  changeStepText: { color: '#D5DCE5', fontSize: 11, fontWeight: '600' },
  categoryScroll: { flexDirection: 'row', marginBottom: 12 },
  categoryOption: {
    width: 110,
    backgroundColor: '#151A20',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#626D7B',
    marginRight: 8,
    alignItems: 'center',
  },
  categoryOptionActive: { borderColor: '#E2E8F0', backgroundColor: '#303741' },
  categoryName: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  categoryNameActive: { color: '#E2E8F0' },
  categoryPrice: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginVertical: 2 },
  categoryDesc: { color: '#64748B', fontSize: 8, textAlign: 'center' },
  favoriteCard: {
    backgroundColor: '#171B22',
    borderColor: '#AEB7C4',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favoriteTitle: { color: '#E2E8F0', fontSize: 12, fontWeight: 'bold' },
  favoriteSubtitle: { color: '#94A3B8', fontSize: 10 },
  tipSelectorRow: { marginTop: 8 },
  tipTitle: { color: '#CBD5E1', fontSize: 11, marginBottom: 6 },
  chipsContainer: { flexDirection: 'row', gap: 6 },
  tipChip: { backgroundColor: '#0F172A', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 14 },
  tipChipActive: { backgroundColor: '#F59E0B' },
  tipChipText: { color: '#CBD5E1', fontSize: 11 },
  tipChipTextActive: { color: '#0F172A', fontWeight: 'bold' },
  confirmBtn: {
    backgroundColor: '#C9D1DA',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  btnLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmBtnText: { color: '#101318', fontSize: 14, fontWeight: 'bold' },
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
  kmBalanceNumber: { fontSize: 30, fontWeight: 'bold', color: '#D5DCE5' },
  kmBalanceUnit: { fontSize: 9, color: '#94A3B8', fontWeight: 'bold' },
  walletActionCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  walletItem: { color: '#E2E8F0', fontSize: 13, marginVertical: 8 },
  addPaymentBtn: { marginTop: 10, backgroundColor: '#1E293B', padding: 10, borderRadius: 10, alignItems: 'center' },
  addPaymentText: { color: '#D5DCE5', fontSize: 12, fontWeight: 'bold' },
  userProfileCard: { backgroundColor: '#111827', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937', marginBottom: 20 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#AEB7C4', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  profileAvatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: '#94A3B8', marginBottom: 2 },
  profilePhone: { fontSize: 13, color: '#E2E8F0', fontWeight: '600', marginBottom: 12 },
  verifiedBadgeRow: { backgroundColor: '#047857', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  verifiedBadgeText: { color: '#ECFDF5', fontSize: 11, fontWeight: 'bold' },
  logoutButtonProfile: { backgroundColor: '#7F1D1D', padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  logoutButtonText: { color: '#FEE2E2', fontSize: 14, fontWeight: 'bold' },
});
