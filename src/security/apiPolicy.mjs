export function apiOrigin(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Configura un origen HTTPS válido para la API.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/') throw new Error('Configura un origen HTTPS válido para la API.');
  return url.origin;
}
export function assertRelativeApiPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\s]/.test(value)) {
    throw new Error('Solo se permiten rutas relativas al servidor configurado.');
  }
  return value;
}
