// Mock database for authentication system
// In a production environment, this would be replaced with a real database connection

interface User {
  id: string;
  email: string;
  password: string; // In production, this would be a hashed password
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory storage for users and password reset tokens
let users: User[] = [];
let passwordResetTokens: PasswordResetToken[] = [];

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// User operations
export async function findUserByEmail(email: string): Promise<User | null> {
  return users.find((user) => user.email === email) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  return users.find((user) => user.id === id) || null;
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const user: User = {
    id: generateId(),
    email,
    password, // In production, hash this password
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.push(user);
  return user;
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<User | null> {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  user.password = newPassword; // In production, hash this password
  user.updatedAt = new Date();
  return user;
}

// Password reset token operations
export async function createPasswordResetToken(userId: string): Promise<PasswordResetToken> {
  const token: PasswordResetToken = {
    id: generateId(),
    userId,
    token: generateId(),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour expiration
    createdAt: new Date(),
  };
  passwordResetTokens.push(token);
  return token;
}

export async function findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  return passwordResetTokens.find((t) => t.token === token) || null;
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  passwordResetTokens = passwordResetTokens.filter((t) => t.token !== token);
}

// Clear all data (useful for testing)
export async function clearDatabase(): Promise<void> {
  users = [];
  passwordResetTokens = [];
}

// Export for testing purposes
export function getUsers(): User[] {
  return [...users];
}

export function getPasswordResetTokens(): PasswordResetToken[] {
  return [...passwordResetTokens];
}
