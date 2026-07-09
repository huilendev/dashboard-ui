// Input validation utilities

import { LoginInput, SignupInput, ResetPasswordInput, ValidationError } from "@/types/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim() === "") {
    return { field: "email", message: "Email is required" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { field: "email", message: "Invalid email format" };
  }
  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password || password.trim() === "") {
    return { field: "password", message: "Password is required" };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { 
      field: "password", 
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` 
    };
  }
  return null;
}

/**
 * Validate login input
 */
export function validateLogin(input: LoginInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(input.email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(input.password);
  if (passwordError) errors.push(passwordError);
  
  return errors;
}

/**
 * Validate signup input
 */
export function validateSignup(input: SignupInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(input.email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(input.password);
  if (passwordError) errors.push(passwordError);
  
  // Check if passwords match
  if (input.confirmPassword && input.password !== input.confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Passwords do not match"
    });
  }
  
  return errors;
}

/**
 * Validate password reset input
 */
export function validateResetPassword(input: ResetPasswordInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(input.email);
  if (emailError) errors.push(emailError);
  
  if (!input.token || input.token.trim() === "") {
    errors.push({ field: "token", message: "Reset token is required" });
  }
  
  const passwordError = validatePassword(input.newPassword);
  if (passwordError) {
    errors.push({ ...passwordError, field: "newPassword" });
  }
  
  if (input.confirmPassword && input.newPassword !== input.confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Passwords do not match"
    });
  }
  
  return errors;
}

/**
 * Check if there are any validation errors
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}
