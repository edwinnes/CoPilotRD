# NosotrosRD Móvil (React Native & Expo) • CoPilotRD®

Paquete oficial de la aplicación móvil de **Pasajeros / Clientes** y **Chóferes** de la plataforma NosotrosRD, integrado con Google Maps Platform y el backend Cloud Run.

---

## 🗺️ Visualización de Mapas en Expo React Native (`CoPilotClientMap`)

El componente `<CoPilotClientMap>` cuenta con un **motor dual inteligente**:
1. **Nativo (Android / iOS con `react-native-maps`):**
   - Renderiza Google Maps con el estilo oficial NosotrosRD Dark Slate.
   - Requiere la clave de Google Maps configurada en `app.json` (sección `android.config.googleMaps.apiKey` e `ios.config.googleMapsApiKey`).
2. **Híbrido Resiliente (Expo Web & Expo Go):**
   - Si se ejecuta en Expo Web (`npx expo start --web`) o en un entorno sin soporte nativo de Google Maps o con `REQUEST_DENIED`, se despliega automáticamente el **Radar GPS Interactivo de Santo Domingo**.
   - Muestra las calles principales (Av. Winston Churchill, Piantini, AILA), marcadores de origen y destino, ruta conectora en azul neón `#00E5FF` y 3 vehículos activos en movimiento en tiempo real con tiempos de llegada (2 min, 4 min, 5 min).
   - **Garantía:** El mapa NUNCA se queda en blanco ni con pantalla negra.

---

## ⚙️ Configuración de Google Maps en `app.json`

En tu archivo `app.json` ya se encuentra configurada la sección requerida para Expo:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.nosotrosrd.copilotrd.client",
      "config": {
        "googleMapsApiKey": "AIzaSy..."
      }
    },
    "android": {
      "package": "com.nosotrosrd.copilotrd.client",
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy..."
        }
      },
      "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
    }
  }
}
```

> 💡 **Nota Importante:** Para que las teselas nativas de Google Maps se descarguen en dispositivos Android, la clave en Google Cloud Console debe tener habilitada la **Maps SDK for Android** y tener una cuenta de facturación vinculada en el proyecto `nosotrosrd-prod-74035`. Si aún no está vinculada, el componente activa el radar interactivo para que la app continúe operativa sin bloqueos.

---

## 🚀 Pasos para Ejecutar en Expo

1. **Instalar dependencias:**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Iniciar servidor Expo:**
   ```bash
   npx expo start
   ```

3. **Opciones de prueba:**
   - **En Navegador Web:** Presiona `w` en la consola para abrir en Expo Web de inmediato.
   - **En Celular Físico:** Escanea el código QR con la app **Expo Go** (Android o iOS).
   - **En Emulador Android:** Presiona `a`.
   - **En Simulador iOS:** Presiona `i`.

---

## 📱 Módulos y Funcionalidades Incluidas

1. **Mapa en Vivo Integrado en Pantalla Principal (`ClientMainDashboard.jsx` y `ClientRequestScreen.jsx`):**
   - Visualización de punto de recogida (Piantini) y destino (AILA / BlueMall / Zona Colonial).
   - Botón de **🔼 Expandir / 🔽 Reducir** mapa.
   - Indicador de distancia y tiempo estimado en tiempo real (31.5 KM • 38 MIN).
2. **Casilla de Chófer Favorito ⭐:**
   - Selección de conductor favorito y fijación de propina adelantada (RD$ 50, 100, 150, 200).
3. **Flotas y Tarifas:**
   - Clásico (RD$ 290), Confort (RD$ 410) y CoPilot XL (RD$ 580).
4. **Banco de KM:**
   - Consulta de saldo de kilómetros acumulados y canjes.
