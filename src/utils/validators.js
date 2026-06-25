export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[\w.-]+@dtu\.ac\.in$/.test(email)) return 'Must be a valid @dtu.ac.in email';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

export const validateName = (name) => {
  if (!name?.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value?.toString().trim()) return `${fieldName} is required`;
  return null;
};
