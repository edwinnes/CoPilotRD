import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

/**
 * Barra de Navegación Unificada con Marco Corporativo Ajustado
 */
export default function ClientBottomNav({ activeTab, onChangeTab, onOpenSettings }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const bottomTabs = [
    { id: 'HOME', label: 'Inicio', icon: '🏠' },
    { id: 'NOTIFICATIONS', label: 'Notificaciones', icon: '🔔' },
    { id: 'WALLET', label: 'Billetera', icon: '💳' },
    { id: 'PROFILE', label: 'Perfil', icon: '👤' },
  ];

  const menuCategories = [
    { id: 'TRIPS_HISTORY', label: 'Historial de Viajes', icon: '📋' },
    { id: 'KM_CLUB', label: 'Club de Socios & KM', icon: '🌟' },
    { id: 'SECURITY', label: 'Seguridad y Privacidad', icon: '🛡️' },
    { id: 'SUPPORT', label: 'Soporte técnico', icon: '💬' },
    { id: 'SETTINGS', label: 'Ajustes del Sistema', icon: '⚙️' },
  ];

  return (
    <>
      {/* 1. MARCO CORPORATIVO SUPERIOR - COMPACTO Y CON TIPOGRAFÍA DESTACADA */}
      <View style={styles.corporateHeaderFrame}>
        <View style={styles.topBarContainer}>
          <TouchableOpacity
            style={styles.sandwichBtn}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.sandwichIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.brandTitleWrapper}>
            <Text style={styles.topBarTitle}>
              CoPilot<Text style={styles.titleAccent}>RD</Text>
            </Text>
          </View>

          <View style={styles.topBarPlaceholder} />
        </View>
      </View>

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
          <View style={styles.menuDrawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menú de Categorías</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawerList}>
              {menuCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.drawerItem}
                  onPress={() => {
                    setMenuVisible(false);
                    if (cat.id === 'SETTINGS' && onOpenSettings) onOpenSettings();
                    else onChangeTab(cat.id);
                  }}
                >
                  <Text style={styles.drawerItemIcon}>{cat.icon}</Text>
                  <Text style={styles.drawerItemText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3. BARRA INFERIOR ESTÁTICA DE MÓDULOS */}
      <View style={styles.navContainer}>
        {bottomTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.navItem}
              onPress={() => onChangeTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.navIcon}>{tab.icon}</Text>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
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
    paddingTop: 24, // Reducido para evitar que baje demasiado
    backgroundColor: '#0E121B',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1E293B',
    zIndex: 90,
  },
  topBarContainer: {
    height: 48,
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
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 64,
    backgroundColor: '#0E121B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#1E293B',
    zIndex: 100,
    paddingBottom: 4,
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
    backgroundColor: '#38BDF8',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
