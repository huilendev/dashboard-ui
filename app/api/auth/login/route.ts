import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  // Get client IP address from headers
  // NextRequest doesn't have a direct .ip property, so we check headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor ?? realIp ?? "unknown";
  
  // Check rate limit
  const rateLimitResult = checkRateLimit(ip);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(rateLimitResult.resetIn / 1000),
      },
      { status: 429, headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetIn / 1000).toString(),
        "Retry-After": Math.ceil(rateLimitResult.resetIn / 1000).toString(),
      } }
    );
  }
  
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
  
  const { email, password } = body;
  
  // Validate required fields
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400, headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetIn / 1000).toString(),
      } }
    );
  }
  
  // TODO: Implement actual authentication logic here
  // For now, return a mock response
  // In a real implementation, you would:
  // 1. Validate credentials against your database
  // 2. Generate a session token or JWT
  // 3. Return appropriate response
  
  // Mock authentication - replace with real logic
  const isValid = email === "admin@example.com" && password === "password";
  
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401, headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetIn / 1000).toString(),
      } }
    );
  }
  
  // Successful login
  return NextResponse.json(
    {
      success: true,
      message: "Login successful",
      // In a real implementation, include a token here
      token: "mock-token-12345",
    },
    { status: 200, headers: {
      "X-RateLimit-Limit": "5",
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetIn / 1000).toString(),
    } }
  );
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
