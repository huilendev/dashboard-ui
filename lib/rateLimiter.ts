// Simple in-memory rate limiter for login attempts
// Limits to 5 attempts per IP address per minute

interface RateLimitEntry {
  count: number;
  lastRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = `login:${ip}`;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    // First request from this IP
    rateLimitStore.set(key, {
      count: 1,
      lastRequest: now,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS };
  }
  
  // Check if window has expired
  if (now - entry.lastRequest > WINDOW_MS) {
    // Reset the window
    rateLimitStore.set(key, {
      count: 1,
      lastRequest: now,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS };
  }
  
  // Within the same window
  if (entry.count >= MAX_ATTEMPTS) {
    const resetIn = WINDOW_MS - (now - entry.lastRequest);
    return { allowed: false, remaining: 0, resetIn };
  }
  
  // Increment count
  rateLimitStore.set(key, {
    count: entry.count + 1,
    lastRequest: entry.lastRequest,
  });
  
  return { 
    allowed: true, 
    remaining: MAX_ATTEMPTS - entry.count - 1,
    resetIn: WINDOW_MS - (now - entry.lastRequest)
  };
}

// Cleanup old entries periodically (optional, but prevents memory growth)
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRequest > WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
