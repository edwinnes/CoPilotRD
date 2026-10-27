import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { House, Bell, Wallet, UserRound } from 'lucide-react-native';
import CoPilotWordmark from './CoPilotWordmark';
import { useAppTheme } from '../context/ThemeContext';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

/**
 * Barra de Navegación Unificada con Marco Corporativo Ajustado
 */
export default function ClientBottomNav({ activeTab, onChangeTab, onOpenSettings }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { colors } = useAppTheme();

  const bottomTabs = [
    { id: 'HOME', label: 'Inicio', Icon: House },
    { id: 'NOTIFICATIONS', label: 'Notificaciones', Icon: Bell },
    { id: 'WALLET', label: 'Billetera', Icon: Wallet },
    { id: 'PROFILE', label: 'Perfil', Icon: UserRound },
  ];

  const menuCategories = [
    { id: 'TRIPS_HISTORY', label: 'Historial de Viajes', icon: '📋' },
    { id: 'KM_CLUB', label: 'Club de Socios & KM', icon: '🌟' },
    { id: 'SECURITY', label: 'Seguridad & JCE', icon: '🛡️' },
    { id: 'SETTINGS', label: 'Ajustes del Sistema', icon: '⚙️' },
  ];

  return (
    <>
      {/* 1. MARCO CORPORATIVO SUPERIOR - COMPACTO Y CON TIPOGRAFÍA DESTACADA */}
      <LinearGradient
        colors={['#292D32', '#181B1F', '#101215', '#24282D']}
        locations={[0, 0.25, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.corporateHeaderFrame}
      >
        <View style={styles.topBarContainer}>
          <TouchableOpacity
            style={[styles.sandwichBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sandwichIcon, { color: colors.text }]}>☰</Text>
          </TouchableOpacity>

          <View style={styles.brandTitleWrapper}>
            <CoPilotWordmark size={24} topMargin={0} style={styles.headerWordmark} />
            <Text style={styles.brandTagline}>
              TU VIAJE, NUESTRA RUTA
            </Text>
          </View>

          <View style={styles.topBarPlaceholder} />
        </View>
      </LinearGradient>

      {/* 2. MODAL DEL MENÚ DESPLEGABLE (CATEGORÍAS) */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuDrawer, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
            <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>Menú de Categorías</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={[styles.closeModalText, { color: colors.muted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawerList}>
              {menuCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.drawerItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => {
                    setMenuVisible(false);
                    if (cat.id === 'SETTINGS' && onOpenSettings) {
                      onOpenSettings();
                    }
                  }}
                >
                  <Text style={styles.drawerItemIcon}>{cat.icon}</Text>
                  <Text style={[styles.drawerItemText, { color: colors.text }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3. BARRA INFERIOR ESTÁTICA DE MÓDULOS */}
      <View style={[
        styles.navContainer,
        {
          backgroundColor: '#101318',
          borderTopColor: '#69727E'
        }
      ]}>
        {bottomTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.navItem}
              onPress={() => onChangeTab(tab.id)}
              activeOpacity={0.8}
            >
              <tab.Icon
                size={21}
                strokeWidth={isActive ? 2.4 : 1.8}
                color={isActive ? '#F0F2F4' : '#929AA3'}
                style={{ marginBottom: 5 }}
              />
              <Text
                style={[
                  styles.navText,
                  { color: isActive ? '#F0F2F4' : '#929AA3' }
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: '#B8C0C8' }
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  corporateHeaderFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    backgroundColor: '#141619',
    borderBottomWidth: 1,
    borderBottomColor: '#50565D',
    zIndex: 90,
    elevation: 6,
  },
  topBarContainer: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sandwichBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#151A27',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222B40',
  },
  sandwichIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  brandTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  brandTagline: {
    marginTop: 4,
    color: '#AEB7C4',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  headerWordmark: {
    marginTop: 0,
  },
  topBarTitle: {
    fontSize: 23, // Tamaño prominente y corporativo
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  titleAccent: {
    color: '#38BDF8', // Acento azul vibrante CoPilotRD
  },
  topBarPlaceholder: {
    width: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-start',
  },
  menuDrawer: {
    width: '78%',
    height: '100%',
    backgroundColor: '#0E121B',
    paddingTop: 50,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeModalText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  drawerList: {
    gap: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#151A27',
    borderWidth: 1,
    borderColor: '#222B40',
  },
  drawerItemIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  drawerItemText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#101318',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#1E293B',
    zIndex: 100,
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  navText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    backgroundColor: '#D5DCE5',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
