# Auditoría de CoPilotRD · 2026-10-26

## Base y límites

Repositorio: `edwinnes/CoPilotRD`. Rama solicitada: `produccion-babel-configuracion`. Commit leído: `7fe70fe3a1b87e0182cc3265196fe5e8fd640c26`, coincidente con `main` en la consulta. Rama local: `audit/security-hardening-2026-10-26`.

La clonación falló por conexión al proxy. Se recuperó el código mediante el conector GitHub y se creó un snapshot Git local de los archivos de aplicación/configuración y lockfile. **El commit de base local es un snapshot, no el commit remoto ni un clon completo**: no incluye los binarios de assets ni los árboles grandes `node_modules`/`.expo`. El parche preparado se aplica sobre un checkout real de la base indicada y conserva sus assets. No se ejecutó la aplicación ni se contactaron servicios de producción. No hay cambios en el servidor.

El conector permite leer el repositorio, pero `create_branch` devolvió `403: Resource not accessible by integration`. No se creó rama remota ni PR; no se sustituyó esta limitación por una escritura directa a `main` o a la rama de producción. La descripción del PR se prepara en `docs/PR.md`.

## Hallazgos y reparaciones

| Severidad | Hallazgo comprobado en la base | Cambio en esta rama |
| --- | --- | --- |
| Crítica | Login aceptaba cualquier identificador y contraseñas maestras | Retirado; el adaptador no autentica hasta integrar un servidor verificado |
| Crítica | Registro creaba identidades locales autenticadas | Retirado; ningún perfil local abre la navegación |
| Alta | AsyncStorage/localStorage eran primera opción para tokens; errores silenciados devolvían éxito | SecureStore nativo, sin fallback en texto plano; web solo memoria; errores de escritura/deleción visibles |
| Alta | Perfil almacenado usado como prueba de sesión | Revalidación obligatoria del servidor, expiración y purga de claves antiguas |
| Alta | Inicio/cierre de sesión podían competir; navegación guardaba copia separada de usuario | Control de generación y serialización de escrituras; un solo proveedor y navegación derivada del contexto |
| Alta | Google/Apple usaban correos e identidades de prueba | Accesos ficticios eliminados; OAuth pendiente |
| Alta | URLs de producción distintas y tokens leídos de claves incompatibles | Un origen HTTPS explícito, sin destino predeterminado; interceptor usa la misma sesión; rechazo de destinos absolutos; invalidación ante 401 |
| Alta | Identificador de cliente/conductor ficticio y cifras de cobro locales | Retirados; despacho/conductor/wallet no disponibles hasta contrato y autorización reales |
| Media | Claves Maps embebidas y WebView sin restricción de origen; atribuciones ocultas | Claves fuera del código, mapa nativo y web separada; eliminado HTML remoto y ocultamiento de atribuciones |
| Media | Watch GPS podía quedar activo tras desmontaje; origen GPS era texto ficticio | Lectura puntual solicitada por usuario, validación de coordenadas y descarte de resultados tardíos; sin watch en segundo plano |
| Media | Recuperación de contraseña anunciaba un envío inexistente; mensajes y badges ficticios | Mensajes explícitos de no disponibilidad; retiradas verificaciones JCE y notificaciones ficticias |
| Media | Entradas JS/TS divergentes y doble AuthProvider | Un registro Expo en index.js; se retira la entrada TS duplicada |
| Media | CLI Expo 58 directa con SDK 57; iconos con peers React incompatibles | Retiradas dependencias directas no usadas; CLI proporcionada por Expo; lockfile recalculado offline |

Eliminar claves del código actual no las revoca ni las elimina del historial Git. El propietario debe revisar restricciones por paquete/bundle/firma y rotar las claves expuestas en su proveedor. No se modificaron credenciales de producción ni se reescribió el historial remoto. `.gitignore` evita nuevos archivos generados/secretos; **no elimina los árboles ya rastreados de `node_modules` y `.expo` en el remoto**. Su retiro y limpieza histórica quedan pendientes de un checkout completo y una revisión de contenido.

## Estado de los requisitos

| Requisito | Estado y límite |
| --- | --- |
| JWT y sesiones | Base de gestión local y almacenamiento implementada y probada con adaptadores. No emite ni verifica firmas JWT por sí misma. El servidor debe comprobar firma, algoritmo permitido, issuer, audience, exp, revocación y permisos. El formato y expiresAt locales no son autorización. |
| Login/registro | Adaptador explícitamente no disponible. Hay rutas declaradas en configuración, pero no contratos verificados ni servidor en este árbol. No se inventaron payloads de API ni respuestas de éxito. |
| Cambio/restablecimiento de contraseña | Pendiente de verificación real de correo/SMS, vencimiento, uso único y límites de intentos del servidor. |
| PIN 4/6 y cambio/desactivación | Pendiente de verificador criptográfico seguro, límites persistentes, reautenticación y recuperación. No se implementa un hash rápido de PIN ni un PIN en texto plano. |
| Biometría | Pendiente de módulo Expo compatible, enrolamiento, invalidación de credencial y pruebas Face ID/huella en dispositivo. No se anuncia operativa. |
| 2FA | Pendiente de alta, desafío, verificación, revocación y recuperación del servidor. No se emula con un código local ni se crea sesión antes de completarlo. |
| Dispositivos/sesiones remotas | Pendiente de listado y revocación por propietario desde servidor. El cierre implementado es local; no promete revocar JWT ya emitidos. |
| Zustand y Zod | Integrados en ajustes; validación adicional de formularios. Versiones declaradas y lock actualizado; instalación/runtime pendientes por red. Ningún secreto persiste en Zustand. |
| Hooks y Event Manager | Hooks GPS/apariencia y eventos sin payload sensible, con limpieza de suscripciones. No se propagan tokens, perfiles, rutas ni pagos por eventos. |
| Privacidad/permisos | Acceso a ajustes del sistema. No solicita cámara sin un flujo que la use. GPS puntual en primer plano. Compartir ruta queda deshabilitado; requiere consentimiento y acceso limitado. |
| Sonido/volumen/voz/tonos/silencio/vibración | Estado pendiente visible; no hay reproductor ni eventos de viaje reales. No se guardan interruptores sin efecto. |
| Altavoz/Bluetooth | Pendiente de capacidades nativas y pruebas de rutas de audio. No se promete control de audio del sistema con un ajuste local. |
| Push maestro/viajes/seguridad/promociones/recibos | Pendiente de módulo compatible, permisos del OS, registro/revocación del token y preferencias de entrega del backend. No se simula envío ni entrega. |
| Mapas/Waze/ahorro de datos | Se retira mapa inseguro/ficticio; mapa nativo de referencia. Navegación externa, destinos verificados y política de caché pendientes. |
| Tema/tamaño/restablecer | Funcionales y persistidos solo para la pantalla de ajustes. Migración del resto del diseño a tokens compartidos pendiente; no se presenta como cambio global. |
| Viajes/GPS/SOS/soporte | Sin despacho hasta contrato; GPS puntual real; SOS abre marcador 911 con aviso explícito; soporte abre correo configurado sin afirmar creación de ticket. |
| SQL/wallet/permisos financieros | No verificables sin servidor; controles y evidencia requerida en FINANCIAL_AUDIT.md. No se ejecutaron migraciones ni cobros. |

## Riesgos y aceptación pendiente

Esta rama cambia deliberadamente la disponibilidad: ya no se puede entrar mediante la simulación de la base ni recuperar una sesión solo por su perfil local. No es una entrega integral de todas las funciones solicitadas y no debe desplegarse como una implementación de autenticación o pagos terminada.

La pérdida de conectividad o un error de revalidación mantienen bloqueada la navegación. La app cierra la sesión al salir de primer plano; debe revisarse esa política con los flujos nativos de permisos/OAuth antes de habilitarlos. Si falla la eliminación segura, se bloquea la sesión local y se escribe una marca no secreta para impedir una restauración accidental; la revocación remota sigue pendiente. Las pruebas usan adaptadores de servidor/almacenamiento de prueba, nunca servicios simulados dentro del producto.

Faltan pruebas de runtime con Zustand/Zod, renderizado y navegación, permisos negados/denegados permanentemente, Maps con claves restringidas, ambos sistemas operativos y dispositivos reales. No se ha certificado compatibilidad completa de Expo ni ausencia de CVEs. Consultar los resultados exactos en VALIDATION.md.
