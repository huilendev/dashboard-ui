// Authentication utilities

import { User } from "@/types/auth";
import { findUserByEmail, createUser, updateUserPassword, createResetToken, findResetToken, deleteResetToken } from "./db";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(userId: string, email: string): string {
  // In a real app, use jsonwebtoken library
  // For this demo, we'll create a simple signed token
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const payload = Buffer.from(JSON.stringify({ 
    sub: userId, 
    email, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  })).toString("base64");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64");
  
  return `${header}.${payload}.${signature}`;
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) {
      return null;
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64");
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Parse payload
    const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
    const payloadObj = JSON.parse(decodedPayload);
    
    // Check expiration
    if (payloadObj.exp && payloadObj.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return { userId: payloadObj.sub, email: payloadObj.email };
  } catch {
    return null;
  }
}

/**
 * Login a user
 */
export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = findUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    return null;
  }
  
  const token = generateToken(user.id, user.email);
  
  return { user, token };
}

/**
 * Signup a new user
 */
export async function signup(email: string, password: string): Promise<{ user: User; token: string }> {
  const existingUser = findUserByEmail(email);
  
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  const hashedPassword = await hashPassword(password);
  
  const user = createUser({
    email,
    password: hashedPassword
  });
  
  const token = generateToken(user.id, user.email);
  
  return { user, token };
}

/**
 * Request a password reset
 */
export async function requestPasswordReset(email: string): Promise<string> {
  const user = findUserByEmail(email);
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return "If an account exists with this email, a reset link has been sent.";
  }
  
  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");
  
  // Store the token (expires in 1 hour)
  createResetToken(email, token, 60);
  
  // In a real app, send an email with the reset link
  // For this demo, return the token
  return token;
}

/**
 * Reset password using a token
 */
export async function resetPassword(
  email: string, 
  token: string, 
  newPassword: string
): Promise<boolean> {
  const resetToken = findResetToken(token);
  
  if (!resetToken || resetToken.email !== email) {
    return false;
  }
  
  const user = findUserByEmail(email);
  
  if (!user) {
    return false;
  }
  
  const hashedPassword = await hashPassword(newPassword);
  
  updateUserPassword(email, hashedPassword);
  
  // Delete the used token
  deleteResetToken(token);
  
  return true;
}
