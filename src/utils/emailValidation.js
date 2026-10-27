export function isValidEmail(value) {
  if (typeof value !== 'string') return false;

  const email = value.trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
