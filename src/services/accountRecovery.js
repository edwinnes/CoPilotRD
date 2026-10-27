import api from './mobileApi';

function getApiError(error) {
  const data = error.response?.data;

  if (error.response?.status === 404) {
    return new Error(
      'El servicio de recuperación todavía no está disponible.'
    );
  }

  if (!error.response) {
    return new Error(
      'No se pudo conectar con el servidor.'
    );
  }

  return new Error(
    data?.message ||
    data?.error?.message ||
    'No fue posible procesar la solicitud.'
  );
}

export async function requestRecoveryOtp({
  identifier,
  channel,
}) {
  try {
    const response = await api.post(
      '/api/v1/auth/recovery/request',
      {
        identifier: identifier.trim(),
        channel,
      }
    );

    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function verifyRecoveryOtp({
  identifier,
  channel,
  code,
}) {
  try {
    const response = await api.post(
      '/api/v1/auth/recovery/verify',
      {
        identifier: identifier.trim(),
        channel,
        code: code.trim(),
      }
    );

    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function resetRecoveryPassword({
  recoveryToken,
  newPassword,
}) {
  try {
    const response = await api.post(
      '/api/v1/auth/recovery/reset',
      {
        recoveryToken,
        newPassword,
      }
    );

    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}
