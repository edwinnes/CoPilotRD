# Revisión financiera y de permisos

## Alcance verificado

El árbol de la aplicación de la base auditada contiene cliente móvil, configuración, recursos, dependencias y registros de Expo. No se encontró servidor, esquema SQL, migraciones, RLS, funciones de wallet, procesador de pagos ni ledger. No se ejecutó ninguna consulta SQL, migración o transacción contra producción.

Se encontraron y retiraron de los flujos reutilizados: saldo de kilómetros predeterminado, tarjeta ficticia, tarifa de respaldo, distancia/duración constantes y `clientId` de ejemplo enviado por el cliente. Las antiguas pantallas de solicitud ahora reutilizan el dashboard. El servicio de despacho permanece explícitamente no disponible; no se acepta una confirmación local como éxito financiero.

Los endpoints en `clientConfig.json` son declaraciones existentes, no evidencia de implementación, autorización o atomicidad. La cotización de referencia y las propinas de la UI nunca deben ser autoridad de cobro.

## Controles que debe demostrar el backend antes de habilitar pagos

| Área | Evidencia requerida | Estado |
| --- | --- | --- |
| Autorización | Identidad y tenant derivados de sesión verificada; política por operación y objeto; denegación por defecto; pruebas IDOR/BOLA | No verificable sin servidor |
| Saldos | Ledger de doble partida, importes enteros en unidad menor y moneda explícita; conciliación entre saldo y asientos | No verificable |
| Atomicidad SQL | Débito, crédito, ledger, comisión y estado dentro de una transacción; rollback completo ante error | No verificable |
| Concurrencia | Bloqueo/aislamiento adecuado; prevención de doble gasto; restricciones e invariantes de saldo; pruebas paralelas | No verificable |
| Idempotencia | Clave única por operación y propietario; detección de payload diferente con la misma clave; reintentos sin cobro doble | No verificable |
| Cotizaciones | Cálculo del servidor, vigencia, moneda, autorización del viaje y referencia a cotización; rechazo de tarifa/distancia manipuladas | No verificable |
| Webhooks | Firma, timestamp, deduplicación, protección frente a repetición y conciliación con proveedor | No verificable |
| Reembolsos | Asiento compensatorio y auditoría inmutable; sin borrado de historia; límites por rol | No verificable |
| Tarjetas | Tokenización del proveedor; PAN/CVV fuera de esta app y de los registros | No verificable |
| PIN/biometría | Desbloqueo local separado de autorización del servidor; operación financiera vinculada al desafío y autorización reforzada | Pendiente |
| Privilegios SQL | Roles de aplicación mínimos, sin DDL ni credenciales administrativas en el móvil; consultas parametrizadas y RLS donde aplique | No verificable |

No se propone ni ejecuta SQL sin el esquema real. Estas son condiciones de aceptación pendientes, no controles implementados. Para cerrar esta auditoría se necesita el código del servidor, esquema anonimizado, contrato de pagos y pruebas en un entorno aislado.
