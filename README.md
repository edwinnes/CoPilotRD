# CoPilotRD · aplicación móvil

Aplicación Expo / React Native. Esta rama corrige accesos simulados y retira datos financieros y de identidad ficticios. **No está lista para producción**: la autenticación real y los servicios críticos están pendientes de integración verificada.

La base solicitada es `produccion-babel-configuracion`, commit `7fe70fe3a1b87e0182cc3265196fe5e8fd640c26`; al consultar GitHub coincidía con `main`. No se ha modificado ninguna de esas ramas ni la producción.

## Desarrollo

Requiere Node >=22.14. Copiar `.env.example` a `.env` y configurar exclusivamente el origen HTTPS revisado de staging. Las variables `EXPO_PUBLIC_*` se incluyen en el cliente y no deben contener secretos. No hay destino de producción por defecto.

```sh
npm ci
npm test
npm run security:scan
npm run check:syntax
npm run validate:expo
npm run typecheck
npm run build:android:bundle
npm run build:ios:bundle
npm start
```

Los comandos de exportación validan bundles JavaScript; no generan ni validan APK/IPA firmados. El flujo CI propuesto incluye instalación, análisis, revisión de dependencias y ambos bundles, sin despliegue.

## Estado real

- Sesiones: SecureStore en dispositivos nativos; memoria de la pestaña en web. No se confía en perfiles guardados ni se guardan tokens en AsyncStorage/localStorage. Cierre al pasar a segundo plano, expiración y bloqueo inmediato ante cierre de sesión. La restauración exige revalidación del servidor.
- Login/registro/OAuth/2FA: bloqueados hasta integrar un contrato de servidor verificado en `src/services/authAdapter.js`. No se autentica por correo ficticio, contraseña maestra ni JWT generado localmente.
- Ajustes: Zustand + Zod para tema y tamaño de texto locales; se aplican a la pantalla de ajustes. El menú muestra el estado pendiente de las funciones que requieren servicios o módulos nativos adicionales.
- GPS: lectura puntual tras solicitar permiso; sin envío de coordenadas al servidor. Mapa nativo, atribuciones conservadas, estado explícito de indisponibilidad en web. No se dibujan rutas ni vehículos ficticios.
- SOS: abre el marcador para llamar al 911 tras confirmación. No es un despacho de emergencia ni envía alertas o ubicación a terceros.
- Soporte: abre el correo configurado mediante `EXPO_PUBLIC_SUPPORT_EMAIL`; no crea tickets ni presenta confirmaciones de entrega.
- Wallet, saldos, tarifas, despacho, permisos de conductor y dispositivos remotos: sin integración operativa; no se presentan datos falsos.

Consultar [auditoría](docs/AUDIT.md), [validación](docs/VALIDATION.md), [revisión financiera](docs/FINANCIAL_AUDIT.md) y [descripción preparada del PR](docs/PR.md).
