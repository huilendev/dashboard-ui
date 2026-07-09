import { POST as loginPOST, GET as loginGET, PUT as loginPUT, DELETE as loginDELETE } from '@/app/api/auth/login/route';
import { POST as signupPOST, GET as signupGET, PUT as signupPUT, DELETE as signupDELETE } from '@/app/api/auth/signup/route';
import { POST as passwordResetPOST, PUT as passwordResetPUT, GET as passwordResetGET, DELETE as passwordResetDELETE } from '@/app/api/auth/password-reset/route';
import { NextRequest } from 'next/server';
import { clearDatabase, getUsers, getPasswordResetTokens } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Helper function to create a mock NextRequest
function createMockRequest(jsonBody: any): NextRequest {
  return {
    json: async () => jsonBody,
  } as any as NextRequest;
}

// Helper function to create a mock NextRequest with method
function createMockRequestWithMethod(jsonBody: any, method: string): NextRequest {
  return {
    json: async () => jsonBody,
    method,
  } as any as NextRequest;
}

describe('Authentication System', () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();
  });

  describe('Login Endpoint', () => {
    it('should return 405 for GET method', async () => {
      const response = await loginGET();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for PUT method', async () => {
      const response = await loginPUT();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for DELETE method', async () => {
      const response = await loginDELETE();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 400 for missing email', async () => {
      const request = createMockRequest({ password: 'password123' });
      const response = await loginPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email is required');
    });

    it('should return 400 for invalid email format', async () => {
      const request = createMockRequest({ email: 'invalid-email', password: 'password123' });
      const response = await loginPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid email address');
    });

    it('should return 400 for missing password', async () => {
      const request = createMockRequest({ email: 'test@example.com' });
      const response = await loginPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Password is required');
    });

    it('should return 400 for short password', async () => {
      const request = createMockRequest({ email: 'test@example.com', password: 'short' });
      const response = await loginPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Password must be at least 8 characters long');
    });

    it('should return 401 for invalid credentials', async () => {
      const request = createMockRequest({ email: 'nonexistent@example.com', password: 'password123' });
      const response = await loginPOST(request);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid email or password');
    });

    it('should return 200 for valid credentials', async () => {
      // First, create a user
      const hashedPassword = await hashPassword('Password123!');
      const signupRequest = createMockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      });
      await signupPOST(signupRequest);

      // Then try to login
      const request = createMockRequest({ email: 'test@example.com', password: 'Password123!' });
      const response = await loginPOST(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.name).toBe('Test User');
      expect(data.user.password).toBeUndefined();
    });
  });

  describe('Signup Endpoint', () => {
    it('should return 405 for GET method', async () => {
      const response = await signupGET();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for PUT method', async () => {
      const response = await signupPUT();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for DELETE method', async () => {
      const response = await signupDELETE();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 400 for missing email', async () => {
      const request = createMockRequest({ password: 'Password123!', name: 'Test User' });
      const response = await signupPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email is required');
    });

    it('should return 400 for invalid email format', async () => {
      const request = createMockRequest({ email: 'invalid-email', password: 'Password123!', name: 'Test User' });
      const response = await signupPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid email address');
    });

    it('should return 400 for missing password', async () => {
      const request = createMockRequest({ email: 'test@example.com', name: 'Test User' });
      const response = await signupPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Password is required');
    });

    it('should return 400 for weak password', async () => {
      const request = createMockRequest({ email: 'test@example.com', password: 'password', name: 'Test User' });
      const response = await signupPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Password must contain at least one uppercase letter');
    });

    it('should return 400 for missing name', async () => {
      const request = createMockRequest({ email: 'test@example.com', password: 'Password123!' });
      const response = await signupPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Name is required');
    });

    it('should return 400 for short name', async () => {
      const request = createMockRequest({ email: 'test@example.com', password: 'Password123!', name: 'A' });
      const response = await signupPOST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Name must be at least 2 characters long');
    });

    it('should return 400 for duplicate email', async () => {
      const request1 = createMockRequest({ email: 'test@example.com', password: 'Password123!', name: 'Test User' });
      await signupPOST(request1);

      const request2 = createMockRequest({ email: 'test@example.com', password: 'Password123!', name: 'Another User' });
      const response = await signupPOST(request2);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User with this email already exists');
    });

    it('should return 201 for valid signup', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      });
      const response = await signupPOST(request);
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.name).toBe('Test User');
      expect(data.user.password).toBeUndefined();
      expect(data.user.id).toBeDefined();
    });
  });

  describe('Password Reset Endpoint', () => {
    it('should return 405 for GET method', async () => {
      const response = await passwordResetGET();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for DELETE method', async () => {
      const response = await passwordResetDELETE();
      const data = await response.json();
      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    describe('POST (Request Password Reset)', () => {
      it('should return 400 for missing email', async () => {
        const request = createMockRequest({});
        const response = await passwordResetPOST(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Email is required');
      });

      it('should return 400 for invalid email format', async () => {
        const request = createMockRequest({ email: 'invalid-email' });
        const response = await passwordResetPOST(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid email address');
      });

      it('should return 200 for valid email (non-existent user)', async () => {
        const request = createMockRequest({ email: 'nonexistent@example.com' });
        const response = await passwordResetPOST(request);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('If an account exists with this email');
        // Token should be undefined for non-existent users
        expect(data.token).toBeUndefined();
      });

      it('should return 200 for valid email (existing user)', async () => {
        // First, create a user
        const signupRequest = createMockRequest({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User'
        });
        await signupPOST(signupRequest);

        // Then request password reset
        const request = createMockRequest({ email: 'test@example.com' });
        const response = await passwordResetPOST(request);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('Password reset link has been sent');
        expect(data.token).toBeDefined();
      });
    });

    describe('PUT (Confirm Password Reset)', () => {
      it('should return 400 for missing token', async () => {
        const request = createMockRequest({ newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
        const response = await passwordResetPUT(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Token is required');
      });

      it('should return 400 for missing newPassword', async () => {
        const request = createMockRequest({ token: 'some-token', confirmPassword: 'NewPassword123!' });
        const response = await passwordResetPUT(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('New password is required');
      });

      it('should return 400 for weak newPassword', async () => {
        const request = createMockRequest({ token: 'some-token', newPassword: 'password', confirmPassword: 'password' });
        const response = await passwordResetPUT(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Password must contain at least one uppercase letter');
      });

      it('should return 400 for mismatched passwords', async () => {
        const request = createMockRequest({ token: 'some-token', newPassword: 'NewPassword123!', confirmPassword: 'DifferentPassword123!' });
        const response = await passwordResetPUT(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Passwords do not match');
      });

      it('should return 400 for invalid token', async () => {
        const request = createMockRequest({ token: 'invalid-token', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
        const response = await passwordResetPUT(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid or expired token');
      });

      it('should return 200 for valid password reset', async () => {
        // First, create a user
        const signupRequest = createMockRequest({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User'
        });
        await signupPOST(signupRequest);

        // Request password reset to get a token
        const resetRequest = createMockRequest({ email: 'test@example.com' });
        const resetResponse = await passwordResetPOST(resetRequest);
        const resetData = await resetResponse.json();
        const token = resetData.token;

        // Confirm password reset
        const request = createMockRequest({ token, newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
        const response = await passwordResetPUT(request);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Password has been reset successfully');
      });
    });
  });
});
