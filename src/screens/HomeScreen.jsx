import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import api from '../services/mobileApi';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [sduiConfig, setSduiConfig] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadHomeSdui();
  }, []);

  const loadHomeSdui = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/sdui/home');
      if (response.data && response.data.schema) {
        setSduiConfig(response.data.schema);
        if (response.data.schema.categories && response.data.schema.categories.length > 0) {
          setSelectedCategory(response.data.schema.categories[0].id);
        }
      }
    } catch (error) {
      console.warn('[HomeScreen SDUI Error]:', error.message);
      Alert.alert(
        'Error de Conexión',
        'No se pudo sincronizar la pantalla principal con el servidor central.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00E676" />
        <Text style={styles.loadingText}>Cargando experiencia CoPilotRD...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cabecera Principal */}
      <View style={styles.header}>
        <Text style={styles.title}>{sduiConfig?.title || 'CoPilotRD'}</Text>
        <Text style={styles.subtitle}>
          {sduiConfig?.city}, {sduiConfig?.region} ({sduiConfig?.currency})
        </Text>
      </View>

      {/* Banner de Beneficios */}
      {sduiConfig?.benefits && (
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitTitle}>🎁 Beneficios Activos</Text>
          {sduiConfig.benefits.kmBank?.enabled && (
            <Text style={styles.benefitItem}>
              • Banco de KM: {sduiConfig.benefits.kmBank.description}
            </Text>
          )}
          {sduiConfig.benefits.hospitalDiscount?.enabled && (
            <Text style={styles.benefitItem}>
              • Triangulación Hospitalaria: {sduiConfig.benefits.hospitalDiscount.description}
            </Text>
          )}
        </View>
      )}

      {/* Selector Dinámico de Categorías */}
      <Text style={styles.sectionTitle}>Selecciona tu Servicio</Text>
      <View style={styles.categoriesContainer}>
        {sduiConfig?.categories?.map((item) => {
          const isSelected = selectedCategory === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryName, isSelected && styles.textSelected]}>
                  {item.name}
                </Text>
                <Text style={[styles.categoryFare, isSelected && styles.textSelected]}>
                  RD${item.baseFare.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.categoryDesc}>{item.description}</Text>
              <Text style={styles.ratesText}>
                RD${item.perKm}/km • RD${item.perMin}/min
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botón Principal de Confirmación */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => Alert.alert('CoPilotRD', 'Solicitando servicio en vivo...')}
      >
        <Text style={styles.actionButtonText}>Solicitar CoPilot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8A99AD',
    marginTop: 15,
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#00E676',
    marginTop: 4,
  },
  benefitsCard: {
    backgroundColor: '#161F33',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00E67640',
    marginBottom: 25,
  },
  benefitTitle: {
    color: '#00E676',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  benefitItem: {
    color: '#CCCCCC',
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  categoriesContainer: {
    gap: 12,
    marginBottom: 25,
  },
  categoryCard: {
    backgroundColor: '#121829',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#212D4A',
  },
  categoryCardSelected: {
    borderColor: '#00E676',
    backgroundColor: '#0D2821',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryFare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00E676',
  },
  textSelected: {
    color: '#00E676',
  },
  categoryDesc: {
    color: '#8A99AD',
    fontSize: 13,
    marginBottom: 8,
  },
  ratesText: {
    color: '#55667E',
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: '#00E676',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#0A0E1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
