# CoPilotRD — Cliente móvil

## Estado de recuperación

Aplicación móvil React Native / Expo con interfaz cromada
y soporte para tema claro y oscuro.

La aplicación conserva:

- Autenticación mediante SDUI.
- Pantallas de carga con identidad visual metálica.
- Navegación y panel principal del cliente.
- Componentes de mapas y seguimiento de viajes.
- Configuración NativeWind y Tailwind.

## Instalación

Requisitos:
- Node.js y npm compatibles con el proyecto.
- Entorno Expo compatible con las versiones declaradas.

Instalar dependencias:

    npm ci

Iniciar Expo:

    npm start

Arranque utilizado en Termux:

    EXPO_OFFLINE=1 node node_modules/.bin/expo start --clear

## Dependencias

Las dependencias están declaradas en package.json.
Las versiones resueltas se conservan en package-lock.json.

No es necesario descargar node_modules desde GitHub.

## Configuración visual

- src/context/ThemeContext.jsx
- src/theme/chromePalette.js
- src/components/ChromeButton.jsx
- src/components/ChromeSurface.jsx
- src/sdui/AuthSduiSkeleton.jsx
- src/navigation/RootNavigator.jsx

Tema claro predeterminado y modo oscuro opcional.

## Backend

El servidor CoPilotRDSRL es un proyecto independiente.

La interfaz SDUI requiere conectividad con el backend.
Actualmente se ha observado un error al obtener el esquema
remoto; la disponibilidad del servidor está pendiente de
verificación.

No se incluyen credenciales, claves privadas ni secretos.
