// Authentication tests
import { describe, it, expect, beforeEach, vi } from "vitest";

// Import validation and auth utilities using relative paths
import { 
  validateLogin, 
  validateSignup, 
  validateResetPassword,
  hasValidationErrors 
} from "../lib/validation";
import { 
  hashPassword, 
  comparePassword,
  generateToken,
  verifyToken,
  login,
  signup,
  requestPasswordReset,
  resetPassword
} from "../lib/auth";
import { 
  findUserByEmail, 
  createUser,
  clearUsers,
  createResetToken,
  findResetToken,
  deleteResetToken
} from "../lib/db";

// Clear database before each test
beforeEach(() => {
  clearUsers();
});

describe("Authentication System", () => {
  describe("Validation", () => {
    describe("validateLogin", () => {
      it("should pass with valid email and password", () => {
        const errors = validateLogin({ email: "test@example.com", password: "password123" });
        expect(hasValidationErrors(errors)).toBe(false);
      });

      it("should fail with invalid email", () => {
        const errors = validateLogin({ email: "invalid", password: "password123" });
        expect(hasValidationErrors(errors)).toBe(true);
        expect(errors[0].field).toBe("email");
      });

      it("should fail with empty password", () => {
        const errors = validateLogin({ email: "test@example.com", password: "" });
        expect(hasValidationErrors(errors)).toBe(true);
        expect(errors[0].field).toBe("password");
      });

      it("should fail with short password", () => {
        const errors = validateLogin({ email: "test@example.com", password: "short" });
        expect(hasValidationErrors(errors)).toBe(true);
        expect(errors[0].message).toContain("at least 8 characters");
      });
    });

    describe("validateSignup", () => {
      it("should pass with valid signup data", () => {
        const errors = validateSignup({ 
          email: "test@example.com", 
          password: "password123",
          confirmPassword: "password123" 
        });
        expect(hasValidationErrors(errors)).toBe(false);
      });

      it("should fail with mismatched passwords", () => {
        const errors = validateSignup({ 
          email: "test@example.com", 
          password: "password123",
          confirmPassword: "different123" 
        });
        expect(hasValidationErrors(errors)).toBe(true);
        expect(errors.some(e => e.field === "confirmPassword")).toBe(true);
      });
    });

    describe("validateResetPassword", () => {
      it("should pass with valid reset data", () => {
        const errors = validateResetPassword({ 
          email: "test@example.com",
          token: "valid-token",
          newPassword: "newpassword123",
          confirmPassword: "newpassword123"
        });
        expect(hasValidationErrors(errors)).toBe(false);
      });

      it("should fail with empty token", () => {
        const errors = validateResetPassword({ 
          email: "test@example.com",
          token: "",
          newPassword: "newpassword123"
        });
        expect(hasValidationErrors(errors)).toBe(true);
        expect(errors.some(e => e.field === "token")).toBe(true);
      });
    });
  });

  describe("Password Hashing", () => {
    it("should hash and verify password", async () => {
      const password = "password123";
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(await comparePassword(password, hash)).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "password123";
      const wrongPassword = "wrongpassword";
      const hash = await hashPassword(password);
      
      expect(await comparePassword(wrongPassword, hash)).toBe(false);
    });
  });

  describe("JWT Token", () => {
    it("should generate and verify token", () => {
      const token = generateToken("1", "test@example.com");
      const decoded = verifyToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe("1");
      expect(decoded?.email).toBe("test@example.com");
    });

    it("should return null for invalid token", () => {
      const decoded = verifyToken("invalid.token.here");
      expect(decoded).toBeNull();
    });
  });

  describe("Database Operations", () => {
    it("should create and find user", () => {
      const user = createUser({ email: "test@example.com", password: "hashed" });
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe("test@example.com");
      
      const foundUser = findUserByEmail("test@example.com");
      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe("test@example.com");
    });

    it("should return null for non-existent user", () => {
      const foundUser = findUserByEmail("nonexistent@example.com");
      expect(foundUser).toBeNull();
    });
  });

  describe("Reset Token Operations", () => {
    it("should create and find reset token", () => {
      createResetToken("test@example.com", "token123", 60);
      
      const foundToken = findResetToken("token123");
      expect(foundToken).not.toBeNull();
      expect(foundToken?.email).toBe("test@example.com");
    });

    it("should delete reset token", () => {
      createResetToken("test@example.com", "token123", 60);
      deleteResetToken("token123");
      
      const foundToken = findResetToken("token123");
      expect(foundToken).toBeNull();
    });
  });

  describe("Auth Functions", () => {
    it("should login with correct credentials", async () => {
      // Create a test user
      const hashedPassword = await hashPassword("password123");
      createUser({ email: "test@example.com", password: hashedPassword });
      
      const result = await login("test@example.com", "password123");
      
      expect(result).not.toBeNull();
      expect(result?.user.email).toBe("test@example.com");
      expect(result?.token).toBeDefined();
    });

    it("should return null with incorrect password", async () => {
      const hashedPassword = await hashPassword("password123");
      createUser({ email: "test@example.com", password: hashedPassword });
      
      const result = await login("test@example.com", "wrongpassword");
      
      expect(result).toBeNull();
    });

    it("should return null with non-existent user", async () => {
      const result = await login("nonexistent@example.com", "password123");
      
      expect(result).toBeNull();
    });

    it("should signup new user", async () => {
      const result = await signup("new@example.com", "password123");
      
      expect(result.user.email).toBe("new@example.com");
      expect(result.token).toBeDefined();
      
      // Verify user was created
      const foundUser = findUserByEmail("new@example.com");
      expect(foundUser).not.toBeNull();
    });

    it("should throw error for existing user signup", async () => {
      await signup("test@example.com", "password123");
      
      await expect(signup("test@example.com", "password456"))
        .rejects.toThrow("User already exists");
    });

    it("should request password reset", async () => {
      createUser({ email: "test@example.com", password: "hashed" });
      
      const token = await requestPasswordReset("test@example.com");
      
      expect(token).toBeDefined();
      expect(findResetToken(token)).not.toBeNull();
    });

    it("should reset password with valid token", async () => {
      createUser({ email: "test@example.com", password: "oldhashed" });
      
      const token = await requestPasswordReset("test@example.com");
      const success = await resetPassword("test@example.com", token, "newpassword123");
      
      expect(success).toBe(true);
      
      // Verify token was deleted
      expect(findResetToken(token)).toBeNull();
    });

    it("should fail to reset password with invalid token", async () => {
      createUser({ email: "test@example.com", password: "oldhashed" });
      
      const success = await resetPassword("test@example.com", "invalid-token", "newpassword123");
      
      expect(success).toBe(false);
    });

    it("should fail to reset password with wrong email", async () => {
      createUser({ email: "test@example.com", password: "oldhashed" });
      const token = await requestPasswordReset("test@example.com");
      
      const success = await resetPassword("wrong@example.com", token, "newpassword123");
      
      expect(success).toBe(false);
    });
  });
});
