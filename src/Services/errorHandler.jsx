
const ERROR_CODES = {
  // Registro
  'email-already-in-use': 'Este correo ya está registrado. Por favor, inicia sesión.',
  'invalid-email': 'El formato del correo electrónico no es válido.',
  'weak-password': 'La contraseña es demasiado débil. Usa al menos 6 caracteres.',
  
  // Login
  'wrong-password': 'Contraseña incorrecta. Verifica tus credenciales.',
  'user-not-found': 'No existe una cuenta con este correo. Por favor regístrate.',
  'email-not-confirmed': 'Por favor, confirma tu correo antes de iniciar sesión.',
  'too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.',
  'user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta a soporte.',
  
  // General
  'default': 'Se produjo un error. Por favor, intenta de nuevo más tarde.',
  'network-error': 'Error de conexión. Verifica tu internet e intenta de nuevo.',
};

export const mapErrorCode = (errorMessage) => {
  if (!errorMessage) return 'default';
  
  if (errorMessage.includes('already registered') || errorMessage.includes('already in use')) {
    return 'email-already-in-use';
  }
  if (errorMessage.includes('Invalid email')) {
    return 'invalid-email';
  }
  if (errorMessage.includes('Password should be')) {
    return 'weak-password';
  }
  if (errorMessage.includes('Invalid login credentials')) {
    return 'wrong-password'; // tambien salta si no se encuentra el usuario
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'email-not-confirmed';
  }
  if (errorMessage.includes('rate limited') || errorMessage.includes('too many requests')) {
    return 'too-many-requests';
  }
  
  return 'default';
};

export const getFriendlyErrorMessage = (errorCode) => {
  return ERROR_CODES[errorCode] || ERROR_CODES.default;
};

export const handleAuthError = (error) => {
  console.error("Error de autenticación:", error);
  const errorCode = mapErrorCode(error.message);
  return {
    code: errorCode,
    message: getFriendlyErrorMessage(errorCode)
  };
};