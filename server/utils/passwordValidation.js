/**
 * Password validation: min 8 chars, uppercase, lowercase, number
 */
export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!minLength) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!hasUpper) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!hasLower) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!hasNumber) return { valid: false, message: 'Password must contain at least one number' };

  return { valid: true };
};
