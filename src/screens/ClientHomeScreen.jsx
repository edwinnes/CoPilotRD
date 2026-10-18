import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  fetchSduiConfig,
  requestSduiTrip,
  setCustomBaseUrl,
  getBaseUrl,
} from '../services/mobileApi';

export default function ClientHomeScreen() {
  const [activeMode, setActiveMode] = useState('ride');
  const [sduiData, setSduiData] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [serverNotice, setServerNotice] = useState(null);

  // Estados de la ruta interactiva
  const [origin, setOrigin] = useState('Zona Colonial, Santo Domingo');
  const [destination, setDestination] = useState('BlueMall Santo Domingo');
  const [stops, setStops] = useState([]);
  const [selectedItem, setSelectedItem] = useState('clasico');

  // Estados de incentivos
  const [favoriteDriver, setFavoriteDriver] = useState(true);
  const [manualTip, setManualTip] = useState('50');

  // Estado de solicitud en curso
  const [requestingTrip, setRequestingTrip] = useState(false);
  const [activeTripResult, setActiveTripResult] = useState(null);

  // Cargar configuración SDUI cuando cambia el modo
  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      setLoadingConfig(true);
      try {
        const result = await fetchSduiConfig(activeMode);
        if (isMounted) {
          setSduiData(result.config);
          setIsUsingFallback(Boolean(result.isFallback));
          if (result.isFallback) {
            setServerNotice(
              'Aviso: Conectado vía esquema SDUI local. Para conectar al panel en vivo, usa tu IP local o túnel Ngrok.'
            );
          } else {
            setServerNotice(null);
          }
          // Pre-seleccionar primer elemento disponible
          const firstItem = result.config?.screenLayout?.activeCardLayout?.items?.[0];
          if (firstItem) {
            setSelectedItem(firstItem.id);
          }
        }
      } catch (err) {
        console.warn('[ClientHomeScreen] Error cargando SDUI:', err);
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [activeMode]);

  // Manejar solicitud de viaje dictada por el SDUI
  const handleRequestTrip = async () => {
    if (!origin || !destination) {
      Alert.alert('Ruta incompleta', 'Debes ingresar un punto de origen y un destino válidos.');
      return;
    }

    setRequestingTrip(true);
    setActiveTripResult(null);

    try {
      const tipNum = parseInt(manualTip, 10) || 0;
      const response = await requestSduiTrip({
        activeMode,
        selectedItemId: selectedItem,
        incentives: {
          favoriteDriver,
          manualTip: tipNum,
        },
        securityDirectives: sduiData?.screenLayout?.securityDirectives || {
          encryptedChat: true,
          encryptedCall: true,
          microphonePermissionRequired: true,
          preciseLocationRequired: true,
        },
        updatedRoute: {
          originAddress: origin,
          destinationAddress: destination,
          stops: stops,
        },
      });

      if (response?.success) {
        setActiveTripResult(response);
      } else {
        Alert.alert('Aviso del Panel', response?.message || 'No se pudo procesar la solicitud.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión con el backend NosotrosRD.');
    } finally {
      setRequestingTrip(false);
    }
  };

  const layout = sduiData?.screenLayout;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Encabezado SDUI */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{layout?.title || 'CENTRO DE SOLICITUDES'}</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.securityBadge}>{layout?.securityBadge || '🔒 Cifrado Panel Activo'}</Text>
          {isUsingFallback && (
            <Text style={styles.fallbackBadge}>Modo Offline / Local</Text>
          )}
        </View>
        {serverNotice && <Text style={styles.noticeText}>{serverNotice}</Text>}
      </View>

      {/* 1. Quick Selectors (Viaje, Moto, Envío, XL) */}
      <View style={styles.selectorsRow}>
        {(layout?.quickSelectors || [
          { id: 'ride', label: 'Viaje', icon: '🚗' },
          { id: 'moto', label: 'Moto', icon: '🏍️' },
          { id: 'envio', label: 'Envío', icon: '📦' },
          { id: 'xl', label: 'XL Familiar', icon: '🚐' },
        ]).map((sel) => {
          const isActive = activeMode === sel.id;
          return (
            <TouchableOpacity
              key={sel.id}
              style={[styles.selectorBtn, isActive && styles.selectorBtnActive]}
              onPress={() => setActiveMode(sel.id)}
            >
              <Text style={styles.selectorIcon}>{sel.icon}</Text>
              <Text style={[styles.selectorLabel, isActive && styles.selectorLabelActive]}>
                {sel.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Route Block (Origen, Paradas Opcionales, Destino) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>📍 RUTA DEL SERVICIO</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>{layout?.routeBlock?.originLabel || 'Origen:'}</Text>
          <TextInput
            style={styles.textInput}
            value={origin}
            onChangeText={setOrigin}
            placeholder="Punto de recogida"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {stops.map((st, i) => (
          <View key={i} style={styles.stopRow}>
            <Text style={styles.stopLabel}>Parada #{i + 1}:</Text>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              value={st}
              onChangeText={(txt) => {
                const next = [...stops];
                next[i] = txt;
                setStops(next);
              }}
              placeholder="Dirección parada intermedia"
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              onPress={() => setStops(stops.filter((_, idx) => idx !== i))}
              style={styles.removeStopBtn}
            >
              <Text style={styles.removeStopText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {layout?.routeBlock?.allowMultipleStops && stops.length < 3 && (
          <TouchableOpacity
            style={styles.addStopBtn}
            onPress={() => setStops([...stops, ''])}
          >
            <Text style={styles.addStopText}>+ Añadir Parada Intermedia</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>{layout?.routeBlock?.destinationLabel || 'Destino:'}</Text>
          <TextInput
            style={styles.textInput}
            value={destination}
            onChangeText={setDestination}
            placeholder="Destino final"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* 3. Active Card Layout (Tarjetas de precio dictadas por el panel) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🚗 CATEGORÍAS DISPONIBLES ({activeMode.toUpperCase()})</Text>
        {loadingConfig ? (
          <ActivityIndicator color="#2563EB" style={{ marginVertical: 20 }} />
        ) : (
          layout?.activeCardLayout?.items?.map((item) => {
            const isSelected = selectedItem === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.priceItem, isSelected && styles.priceItemActive]}
                onPress={() => setSelectedItem(item.id)}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                    <Text style={styles.itemEta}>⏱ Llegada en {item.eta} min</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemPrice}>RD$ {item.priceDOP}</Text>
                  {item.surge && item.surge.type !== 'STABLE' && (
                    <Text style={styles.surgeText}>{item.surge.percentage}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* 4. Incentives Block (Chofer Favorito & Propina) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>⭐ INCENTIVOS AL PILOTO</Text>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setFavoriteDriver(!favoriteDriver)}
        >
          <Text style={styles.checkboxIcon}>{favoriteDriver ? '☑️' : '⬜'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkboxTitle}>Asignar a mi Piloto Favorito si está cerca</Text>
            <Text style={styles.checkboxDesc}>Prioridad de despacho con pilotos 5 estrellas</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.tipRow}>
          <Text style={styles.tipLabel}>Propina voluntaria (RD$):</Text>
          <TextInput
            style={styles.tipInput}
            value={manualTip}
            onChangeText={setManualTip}
            keyboardType="numeric"
            placeholder={layout?.incentivesBlock?.tipPlaceholder || '0'}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* 5. Botón de Solicitud */}
      <TouchableOpacity
        style={[styles.submitButton, requestingTrip && styles.submitButtonDisabled]}
        onPress={handleRequestTrip}
        disabled={requestingTrip}
      >
        {requestingTrip ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Confirmar y Solicitar ({activeMode.toUpperCase()})</Text>
        )}
      </TouchableOpacity>

      {/* Resultado del viaje activo */}
      {activeTripResult && (
        <View style={styles.tripResultBox}>
          <Text style={styles.resultTitle}>🎉 ¡SOLICITUD EN PROCESO!</Text>
          <Text style={styles.resultId}>Viaje: {activeTripResult.tripId}</Text>
          <Text style={styles.resultStatus}>Estado: {activeTripResult.status}</Text>
          <Text style={styles.resultSession}>
            🔒 Sesión Segura: {activeTripResult.communication?.sessionId}
          </Text>
          <Text style={styles.resultMsg}>{activeTripResult.message}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.5 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  securityBadge: { fontSize: 11, color: '#10B981', fontWeight: '700' },
  fallbackBadge: { fontSize: 10, color: '#F59E0B', backgroundColor: '#78350F33', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  noticeText: { fontSize: 11, color: '#94A3B8', marginTop: 6, fontStyle: 'italic' },
  selectorsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  selectorBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, marginHorizontal: 3, backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  selectorBtnActive: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  selectorIcon: { fontSize: 18 },
  selectorLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  selectorLabelActive: { color: '#FFFFFF' },
  card: { backgroundColor: '#131D31', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#1E293B' },
  cardHeader: { fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  inputLabel: { width: 65, fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  textInput: { flex: 1, backgroundColor: '#1E293B', color: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, fontSize: 13 },
  stopRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  stopLabel: { width: 65, fontSize: 11, color: '#38BDF8' },
  removeStopBtn: { marginLeft: 8, padding: 6 },
  removeStopText: { color: '#EF4444', fontWeight: 'bold' },
  addStopBtn: { paddingVertical: 6, marginVertical: 4 },
  addStopText: { fontSize: 12, color: '#38BDF8', fontWeight: '600' },
  priceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#1E293B', marginVertical: 4, borderWidth: 1, borderColor: '#334155' },
  priceItemActive: { borderColor: '#3B82F6', backgroundColor: '#1E3A8A33' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemIcon: { fontSize: 24, marginRight: 10 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  itemDesc: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  itemEta: { fontSize: 11, color: '#10B981', marginTop: 2 },
  itemRight: { alignItems: 'flex-end', marginLeft: 8 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#F8FAFC' },
  surgeText: { fontSize: 10, color: '#F59E0B', fontWeight: '700', marginTop: 2 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  checkboxIcon: { fontSize: 18, marginRight: 8 },
  checkboxTitle: { fontSize: 12, fontWeight: '700', color: '#F8FAFC' },
  checkboxDesc: { fontSize: 11, color: '#94A3B8' },
  tipRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  tipLabel: { fontSize: 12, color: '#94A3B8' },
  tipInput: { backgroundColor: '#1E293B', color: '#F8FAFC', width: 90, textAlign: 'center', paddingVertical: 6, borderRadius: 8, fontSize: 13, fontWeight: 'bold' },
  submitButton: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  tripResultBox: { marginTop: 16, padding: 14, backgroundColor: '#064E3B', borderRadius: 14, borderWidth: 1, borderColor: '#059669' },
  resultTitle: { fontSize: 14, fontWeight: '800', color: '#34D399', marginBottom: 4 },
  resultId: { fontSize: 12, color: '#E2E8F0', fontFamily: 'monospace' },
  resultStatus: { fontSize: 12, color: '#A7F3D0', fontWeight: '600', marginTop: 2 },
  resultSession: { fontSize: 11, color: '#6EE7B7', marginTop: 2 },
  resultMsg: { fontSize: 11, color: '#D1FAE5', marginTop: 6, fontStyle: 'italic' },
});
