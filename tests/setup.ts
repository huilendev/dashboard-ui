// Test setup file
import { beforeAll, afterAll, vi } from "vitest";

// Mock Next.js request/response
beforeAll(() => {
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
});

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "1h";
