/**
 * CoPilotRD — Adaptador de seguimiento.
 *
 * Solo transforma datos recibidos de una fuente confiable.
 * No crea viajes, tarifas, conductores ni estados ficticios.
 *
 * Los estados admitidos son provisionales hasta validar
 * el contrato definitivo del backend.
 */

const TRACKABLE_STATUSES = new Set([
  'CONFIRMED',
  'DRIVER_ASSIGNED',
  'DRIVER_ARRIVING',
  'IN_PROGRESS',
]);

export function adaptConfirmedTrip(rawTrip) {
  if (!rawTrip || typeof rawTrip !== 'object') {
    return null;
  }

  const id = rawTrip.id;
  const status = rawTrip.status;

  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    String(id).trim() === '' ||
    typeof status !== 'string' ||
    !TRACKABLE_STATUSES.has(status.toUpperCase())
  ) {
    return null;
  }

  const driver =
    rawTrip.driver &&
    typeof rawTrip.driver === 'object' &&
    !Array.isArray(rawTrip.driver)
      ? rawTrip.driver
      : null;

  const fare =
    rawTrip.fare &&
    typeof rawTrip.fare === 'object' &&
    !Array.isArray(rawTrip.fare)
      ? rawTrip.fare
      : null;

  return {
    id,
    status: status.toUpperCase(),
    statusText:
      typeof rawTrip.statusText === 'string'
        ? rawTrip.statusText
        : status.toUpperCase(),
    category:
      typeof rawTrip.category === 'string'
        ? rawTrip.category
        : null,
    destinationAddress:
      typeof rawTrip.destinationAddress === 'string'
        ? rawTrip.destinationAddress
        : null,
    remainingTimeText:
      typeof rawTrip.remainingTimeText === 'string'
        ? rawTrip.remainingTimeText
        : null,
    driver,
    fare,
    pointsOfInterest: Array.isArray(rawTrip.pointsOfInterest)
      ? rawTrip.pointsOfInterest
      : [],
    priorityOptions: Array.isArray(rawTrip.priorityOptions)
      ? rawTrip.priorityOptions
      : [],
  };
}
