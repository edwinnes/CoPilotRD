# Validación verificable · 2026-10-26

Entorno: Node 24.19.0 / npm 11.9.0. No se utilizó un servidor de producción ni datos reales de usuarios.

| Comprobación | Resultado observado |
| --- | --- |
| `npm test` | 25 pruebas aprobadas de sesiones, almacenamiento, eventos y política de URL. Sin dependencias externas. Los tests de SecureStore usan adaptadores en VM; no prueban el hardware. |
| `npm run security:scan` | 30 archivos de aplicación/configuración, 7 reglas dirigidas, sin coincidencias. No es SAST exhaustivo ni auditoría de CVEs. |
| `npm run check:syntax` | 35 archivos parseados, imports relativos resueltos. Se usó `COPILOT_AUDIT_PARSER=/tmp/copilot-babel-parser.cjs`, parser 7.29.9 recuperado del snapshot del repositorio. No fue una instalación npm ni una compilación Expo. |
| `git diff --check` | Sin errores de espacios en el estado final. |
| `npm install --package-lock-only --ignore-scripts --offline` | Aprobado. npm recalculó el lockfile después de retirar CLI 58, lucide y WebView. No instala paquetes. |
| Coherencia manifest/lock | Dependencias de raíz idénticas; CLI retenida por Expo: 57.0.31. |
| Comparación de dependencias nativas | Las 8 versiones comparadas coinciden con `bundledNativeModules.json` de Expo recuperado del snapshot. Ver `expo-native-reference.json`. Esa comparación no sustituye `expo install --check` tras instalar desde el registro. |
| `npm view expo version` | Bloqueado: conexión al registro rechazada por el proxy (`EPERM`); la clonación Git también falló por conexión al proxy. |
| `npm ci --ignore-scripts --offline` | Bloqueado: `ENOTCACHED`, tarball de Zustand ausente. No se afirma instalación completa. |
| `npm run validate:expo` | No ejecutó validación: `expo: not found` (127), consecuencia de la instalación bloqueada. |
| `npm run typecheck` | No ejecutó TypeScript: `tsc: not found` (127). El proyecto mantiene JS con `checkJs: false`; no se afirma cobertura completa de tipos. |
| `npm audit --json` | Sin resultado de vulnerabilidades: el endpoint de advisories falló por `EPERM` en el proxy. No se informa «cero CVEs». |
| `npm run build:android:bundle` | No generó bundle: `expo: not found` (127). |
| `npm run build:ios:bundle` | No generó bundle: `expo: not found` (127). |
| APK/IPA, permisos, GPS, biometría y navegación en dispositivo | Pendientes; no hay emulador ni dispositivo probado. |
| GitHub rama / PR | La creación de rama remota fue rechazada con 403 `Resource not accessible by integration`; publicación pendiente. |

El lockfile mantiene las integridades existentes. La metadata de Zustand 5.0.8 se contrastó en tres lockfiles públicos coincidentes, y npm recalculó el árbol offline. Como no pudo descargarse el paquete, su integridad y funcionamiento deben verificarse con `npm ci` desde el registro autorizado antes de integrar. Las versiones de Zod, Babel y del preset de Expo ya figuraban en el lock original y se declararon directamente donde se usan.

Los logs de las comprobaciones que sí se ejecutan se adjuntan como `test-results.txt`, `syntax-results.txt` y `security-results.txt`. CI está preparado, pero no se ejecutó en GitHub y no existe un estado verde remoto.

## Pasos pendientes en un checkout completo y autorizado

1. Aplicar el parche sobre la base indicada en `AUDIT.md` y crear una rama independiente.
2. Ejecutar `npm ci` con acceso al registro; no usar `--legacy-peer-deps` ni omitir verificaciones para silenciar incompatibilidades.
3. Ejecutar pruebas, sintaxis, TypeScript, `expo install --check` y auditoría de dependencias; resolver resultados reales.
4. Exportar ambos bundles y generar builds de desarrollo aislados; probar hardware, permisos y transiciones foreground/background.
5. Integrar contratos revisados de autenticación/2FA/sesiones, despacho y wallet antes de habilitar esas funciones. Revisar la política de bloqueo al salir del primer plano para OAuth/permisos.
6. Auditar servidor/SQL conforme a `FINANCIAL_AUDIT.md`. No ejecutar migraciones destructivas ni desplegar sin autorización.
7. Abrir PR como borrador y mantener las limitaciones explícitas. No fusionar ni desplegar esta propuesta como una entrega completa de pagos o seguridad.
