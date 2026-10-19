import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import CoPilotClientMap from '../components/CoPilotClientMap';
import api from '../services/mobileApi';
import { DEFAULT_LOCATIONS } from '../services/mapService';

export default function HomeScreen() {
  const [pickupText, setPickupText] = useState(DEFAULT_LOCATIONS.pickup.name);
  const [destText, setDestText] = useState(DEFAULT_LOCATIONS.destination.name);
  const [quoteData, setQuoteData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('clasico');

  const handleGetQuote = async () => {
    try {
      const response = await api.post('/api/v1/clients/fares/quote', {
        distanceKm: 6.4,
        durationMinutes: 18
      });
      if (response.data && response.data.success) {
        setQuoteData(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  const handleRequestRide = async () => {
    if (!quoteData) {
      Alert.alert('Aviso', 'Primero obtén la cotización de la ruta.');
      return;
    }
    const selectedFare = quoteData.fares.find(f => f.id === selectedCategory);
    try {
      const response = await api.post('/api/v1/clients/trips/request', {
        origin: pickupText,
        destination: destText,
        fareDOP: selectedFare ? selectedFare.priceDOP : 350
      });
      if (response.data && response.data.success) {
        Alert.alert('¡Éxito!', `Conductor asignado: ${response.data.assignedDriver.fullName}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. MAPA DE FONDO COMPLETO (Conserva gestos y baja por debajo) */}
      <View style={styles.backgroundMap}>
        <CoPilotClientMap isExpanded={true} />
      </View>

      {/* 2. PANEL Y CONSOLA DE SOLICITUD FLOTANTE */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.panelCard}>
          <View style={styles.handleBar} />
          <Text style={styles.panelTitle}>NósotrosRD - Planificador Dinámico</Text>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              value={pickupText}
              onChangeText={setPickupText}
              placeholder="Punto de Origen"
              placeholderTextColor="#8A99AD"
            />
            <TextInput
              style={styles.input}
              value={destText}
              onChangeText={setDestText}
              placeholder="Punto de Destino"
              placeholderTextColor="#8A99AD"
            />
            <TouchableOpacity style={styles.calcButton} onPress={handleGetQuote}>
              <Text style={styles.calcButtonText}>Calcular Ruta y Tarifas</Text>
            </TouchableOpacity>
          </View>

          {quoteData && quoteData.fares && (
            <>
              <Text style={styles.sectionTitle}>Selecciona Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
                {quoteData.fares.map((item) => {
                  const isSelected = selectedCategory === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                      onPress={() => setSelectedCategory(item.id)}
                    >
                      <Text style={[styles.categoryName, isSelected && styles.textSelected]}>{item.name}</Text>
                      <Text style={[styles.categoryFare, isSelected && styles.textSelected]}>RD$ {item.priceDOP}</Text>
                      <Text style={styles.categoryEta}>ETA: {item.etaMinutes} min</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity style={styles.actionButton} onPress={handleRequestRide}>
                <Text style={styles.actionButtonText}>Confirmar y Solicitar Viaje</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  backgroundMap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  panelCard: {
    backgroundColor: '#121829',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#212D4A',
    padding: 20,
    paddingBottom: 35,
    maxHeight: '60%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#2F3E5D',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: '#161F33',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#212D4A',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#212D4A',
    marginBottom: 8,
  },
  calcButton: {
    backgroundColor: '#212D4A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  calcButtonText: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoriesRow: {
    marginBottom: 15,
  },
  categoryCard: {
    backgroundColor: '#161F33',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#212D4A',
    marginRight: 10,
    width: 140,
  },
  categoryCardSelected: {
    borderColor: '#00E676',
    backgroundColor: '#0D2821',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryFare: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00E676',
    marginBottom: 2,
  },
  categoryEta: {
    fontSize: 11,
    color: '#8A99AD',
  },
  textSelected: {
    color: '#00E676',
  },
  actionButton: {
    backgroundColor: '#00E676',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#0A0E1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
