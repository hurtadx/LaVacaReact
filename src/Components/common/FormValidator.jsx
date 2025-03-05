
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_USERNAME_LENGTH = 3;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validatePassword = (password) => {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` };
  }
  return { isValid: true };
};

export const validateEmail = (email) => {
  if (!email || !EMAIL_REGEX.test(email)) {
    return { isValid: false, message: "Por favor, ingresa un email válido" };
  }
  return { isValid: true };
};

export const validateUsername = (username) => {
  if (!username || username.length < MIN_USERNAME_LENGTH) {
    return { isValid: false, message: `El nombre de usuario debe tener al menos ${MIN_USERNAME_LENGTH} caracteres` };
  }
  return { isValid: true };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, message: "Las contraseñas no coinciden" };
  }
  return { isValid: true };
};