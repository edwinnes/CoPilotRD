# Eliminar accesos simulados y preparar sesiones seguras y ajustes auditables

Base propuesta: `produccion-babel-configuracion`.
Head propuesto: `audit/security-hardening-2026-10-26`.
Estado: **borrador; pendiente de publicación por permisos de la integración**.

La aplicación permitía iniciar sesión con cualquier identificador, autenticaba perfiles creados localmente y guardaba credenciales sin cifrar. Esta propuesta elimina esos accesos, centraliza la sesión y bloquea autenticación, despacho y wallet hasta disponer de contratos de servidor verificados. No se inventan endpoints ni se envían peticiones a producción por defecto.

## Cambios

- SecureStore nativo sin fallback en texto plano; web solo en memoria; purga de datos antiguos, expiración, revalidación obligatoria, bloqueo inmediato y protección frente a carreras login/logout y restauración tardía.
- Un AuthProvider y un punto de registro Expo; navegación derivada de la sesión. Se elimina la entrada TS duplicada.
- Retiradas identidades sociales ficticias, recuperación de contraseña simulada, badges JCE, notificaciones y saldos/métodos de pago de ejemplo. Las pantallas de solicitud antiguas reutilizan el dashboard revisado.
- Origen HTTPS explícito para API, bloqueo de destinos externos y cierre ante 401. Las rutas declaradas previamente se conservan como referencia, sin asumir su contrato.
- Zustand + Zod para ajustes locales de apariencia; controles críticos muestran su indisponibilidad. Hooks de GPS puntual y apariencia, Event Manager sin datos sensibles.
- Mapa nativo con atribución; sin WebView insegura ni rutas ficticias. SOS abre marcador 911 con confirmación y límite explícito. Soporte usa únicamente el correo configurado.
- Retiradas dependencias directas innecesarias/incompatibles; lock recalculado con npm offline. CI propuesto para pruebas, instalación, análisis y bundles sin despliegue.
- Auditoría financiera y matriz de pendientes, con límites de alcance y pruebas documentados.

## Validación observada

25 pruebas aprobadas. Parseo de 35 archivos y resolución de imports relativos aprobados. Escaneo dirigido de 30 archivos con 7 reglas aprobado. `git diff --check` aprobado. Lockfile recalculado offline y dependencias de raíz coherentes; 8 versiones nativas coinciden con el manifiesto Expo del snapshot.

**No validados:** instalación completa, auditoría de CVEs, chequeo Expo, TypeScript, bundles Android/iOS, builds nativos, runtime de Zustand/Zod, hardware y flujos reales de servidor. El registro npm está inaccesible; los comandos Expo/TypeScript fallaron por herramientas no instaladas. No hay CI remoto ejecutado.

## Bloqueos y efectos visibles

El acceso local inseguro deja de funcionar; no hay login real habilitado. PIN 4/6, biometría, 2FA, cambio de contraseña con correo/SMS, sesiones remotas, compartir ruta, audio/Bluetooth, push, navegación externa y autorización financiera requieren integraciones pendientes. Tema y texto solo se aplican a ajustes. SOS no despacha emergencias ni comparte ubicación. No se ha revocado ninguna credencial remota.

No hay servidor, SQL ni ledger en este árbol para verificar atomicidad, RLS o doble gasto. El cliente no es autoridad sobre roles, propietarios o importes. No se ejecutaron migraciones ni se modificó producción.

Consultar `docs/AUDIT.md`, `docs/VALIDATION.md` y `docs/FINANCIAL_AUDIT.md` antes de revisar. La propuesta debe permanecer en borrador hasta completar las verificaciones e integraciones que correspondan.
