// Validation types

// UserName validation function
export const validateUsername = (username) => {
  if (!username) {
    return "Username is required";
  }

  if (!username.trim()) {
    return "Username cannot be empty";
  }

  return null;
};

// Email validation function
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

// Password validation function
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return "Weak password: add upper, lower, number";
  }

  return null;
};

// Confirm Password validation function
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Confirm Password is required";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};

// Main validation function for login form
export const validateSignUp = (formData) => {
  const errors = {};
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
};
