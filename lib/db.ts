// In-memory database for authentication (for demo purposes)
// In a production app, replace with a real database like PostgreSQL, MongoDB, etc.

import { User } from "@/types/auth";

let users: User[] = [];

/**
 * Initialize the database with some test users
 */
export function initializeDatabase(): void {
  // Check if we already have users
  if (users.length === 0) {
    // Add a test user for development
    const testUser: User = {
      id: "1",
      email: "test@example.com",
      password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // hashed "password123"
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(testUser);
  }
}

/**
 * Find a user by email
 */
export function findUserByEmail(email: string): User | null {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find a user by ID
 */
export function findUserById(id: string): User | null {
  return users.find(user => user.id === id) || null;
}

/**
 * Create a new user
 */
export function createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): User {
  const newUser: User = {
    ...user,
    id: (users.length + 1).toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  users.push(newUser);
  return newUser;
}

/**
 * Update a user's password
 */
export function updateUserPassword(email: string, newPassword: string): User | null {
  const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex] = {
    ...users[userIndex],
    password: newPassword,
    updatedAt: new Date()
  };
  
  return users[userIndex];
}

/**
 * Get all users (for testing purposes)
 */
export function getAllUsers(): User[] {
  return [...users];
}

/**
 * Clear all users (for testing purposes)
 */
export function clearUsers(): void {
  users = [];
}

/**
 * Store password reset tokens (in-memory for demo)
 */
interface ResetToken {
  email: string;
  token: string;
  expiresAt: Date;
}

let resetTokens: ResetToken[] = [];

/**
 * Generate and store a reset token
 */
export function createResetToken(email: string, token: string, expiresInMinutes: number = 60): void {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
  
  resetTokens.push({ email, token, expiresAt });
}

/**
 * Find a reset token
 */
export function findResetToken(token: string): ResetToken | null {
  const foundToken = resetTokens.find(t => t.token === token);
  
  if (!foundToken) {
    return null;
  }
  
  // Check if token has expired
  if (foundToken.expiresAt < new Date()) {
    return null;
  }
  
  return foundToken;
}

/**
 * Delete a reset token after use
 */
export function deleteResetToken(token: string): void {
  resetTokens = resetTokens.filter(t => t.token !== token);
}

// Initialize database on import
initializeDatabase();
