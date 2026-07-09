import { compare, hash } from "bcryptjs";
import * as db from "./db";

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await hash(password, saltRounds);
}

// Compare a password with a hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}

// Login a user
export async function login(email: string, password: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string };
  error?: string;
}> {
  const user = await db.findUserByEmail(email);
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return { success: false, error: "Invalid email or password" };
  }

  // Return user data without password
  const { password: _, ...userData } = user;
  return { success: true, user: userData };
}

// Signup a new user
export async function signup(email: string, password: string, name: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string };
  error?: string;
}> {
  // Check if user already exists
  const existingUser = await db.findUserByEmail(email);
  if (existingUser) {
    return { success: false, error: "User with this email already exists" };
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create the user
  const user = await db.createUser(email, hashedPassword, name);

  // Return user data without password
  const { password: _, ...userData } = user;
  return { success: true, user: userData };
}

// Request a password reset
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  token?: string;
}> {
  const user = await db.findUserByEmail(email);
  if (!user) {
    // Don't reveal that the user doesn't exist for security reasons
    return { success: true, message: "If an account exists with this email, a password reset link has been sent" };
  }

  // Create a password reset token
  const token = await db.createPasswordResetToken(user.id);

  // In production, you would send an email with the reset link here
  // For now, we'll return the token for testing purposes
  return { success: true, message: "Password reset link has been sent", token: token.token };
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const resetToken = await db.findPasswordResetToken(token);
  if (!resetToken) {
    return { success: false, error: "Invalid or expired token" };
  }

  // Check if token has expired
  if (resetToken.expiresAt < new Date()) {
    await db.deletePasswordResetToken(token);
    return { success: false, error: "Token has expired" };
  }

  // Find the user
  const user = await db.findUserById(resetToken.userId);
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update the user's password
  await db.updateUserPassword(user.id, hashedPassword);

  // Delete the used token
  await db.deletePasswordResetToken(token);

  return { success: true, message: "Password has been reset successfully" };
}
