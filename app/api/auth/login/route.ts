import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per 15 minutes

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();

// Clean up old entries periodically to prevent memory leaks
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.lastRequest > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(ip);
    }
  }
}

// Get client IP address from request
function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers (for different hosting environments)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const socketIP = request.headers.get('x-socket-ip');
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || socketIP || 'unknown';
}

// Rate limiter middleware
function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Clean up old entries
  cleanupRateLimitStore();
  
  const clientData = rateLimitStore.get(ip);
  
  if (!clientData) {
    // First request from this IP
    rateLimitStore.set(ip, { count: 1, lastRequest: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }
  
  // Check if the window has expired
  if (now - clientData.lastRequest > RATE_LIMIT_WINDOW) {
    // Reset the window
    rateLimitStore.set(ip, { count: 1, lastRequest: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }
  
  // Check if limit is exceeded
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: clientData.lastRequest + RATE_LIMIT_WINDOW };
  }
  
  // Increment count and update last request time
  rateLimitStore.set(ip, { count: clientData.count + 1, lastRequest: now });
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - clientData.count - 1, resetAt: clientData.lastRequest + RATE_LIMIT_WINDOW };
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.max(retryAfter, 1)
        },
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetAt / 1000))
          }
        }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // TODO: Implement actual authentication logic here
    // This is a placeholder for the actual login logic
    // In a real application, you would:
    // 1. Look up the user by email
    // 2. Verify the password
    // 3. Generate a session token or JWT
    // 4. Return the authentication result
    
    // For now, return a mock successful response
    const mockUser = {
      id: 'user_123',
      email: email,
      name: 'Test User'
    };
    
    // Set rate limit headers on successful responses too
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetAt / 1000))
    });
    
    return NextResponse.json(
      {
        success: true,
        user: mockUser,
        message: 'Login successful'
      },
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Return a generic error message for security reasons
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}