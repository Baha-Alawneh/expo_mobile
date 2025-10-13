
export const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  if (!email.trim()) {
    return "Email cannot be empty";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return null;
};

export const validatePassword = (password)=> {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 5) {
    return "Password must be at least 5 characters long";
  }

  return null;
};

export const validateLogin = (
  formData
) => {
  const errors = {};

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};
