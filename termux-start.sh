#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Script de Inicio Rápido de NosotrosRD / CoPilotRD Móvil para Termux (Android)
# ==============================================================================

set -e

echo "🚀 [NosotrosRD] Configurando entorno de desarrollo en Termux Android..."

# 1. Verificar Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "📦 Instalando Node.js LTS en Termux..."
    pkg update -y && pkg install -y nodejs-lts git
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js detectado: $NODE_VERSION"

# 2. Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Expo React Native (npm install)..."
    npm install --legacy-peer-deps
fi

# 3. Opciones de red para Termux
echo "--------------------------------------------------------------"
echo "🌐 SELECCIONA EL MODO DE RED PARA EXPO GO:"
echo "  1) Localhost (Recomendado si abres Expo Go en este MISMO celular)"
echo "  2) Tunnel (Recomendado si estás en Wi-Fi o red móvil con firewall)"
echo "  3) LAN (Si tienes otra PC o dispositivo en la misma red Wi-Fi)"
echo "--------------------------------------------------------------"
read -p "Elige una opción [1/2/3] (Por defecto 1): " NET_MODE

case $NET_MODE in
    2)
        echo "🚀 Iniciando Expo con Tunnel..."
        npx expo start --tunnel
        ;;
    3)
        echo "🚀 Iniciando Expo con LAN..."
        npx expo start --lan
        ;;
    *)
        echo "🚀 Iniciando Expo con Localhost (Directo para este teléfono)..."
        npx expo start --localhost
        ;;
esac
