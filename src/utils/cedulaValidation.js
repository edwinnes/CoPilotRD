export function formatCedula(value) {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}

export function isValidCedulaFormat(value) {
  return typeof value === 'string' &&
    /^\d{3}-\d{7}-\d$/.test(value);
}
