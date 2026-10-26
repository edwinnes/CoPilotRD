// This repository contains no verified login/register/session/2FA API contract.
// Install a reviewed adapter here only after the real server contract is supplied.
// It must finish MFA before returning {token, user, expiresAt} and verify sessions
// on the server. Do not accept emails, local profiles or a decoded JWT as proof.
const unavailable = async () => {
  throw new Error('Acceso no disponible: falta integrar el servicio de autenticación verificado.');
};
export const authAdapter = Object.freeze({
  login: unavailable, register: unavailable, verifySession: unavailable,
});
