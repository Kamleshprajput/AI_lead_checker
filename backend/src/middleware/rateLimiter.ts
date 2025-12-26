import { Request, Response, NextFunction } from "express";

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

/**
 * Get client identifier (IP address)
 */
function getClientId(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

/**
 * Rate limiting middleware
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientId(req);
  const now = Date.now();
  
  // Clean up expired entries
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
  
  // Get or create client record
  const clientRecord = store[clientId];
  
  if (!clientRecord || clientRecord.resetTime < now) {
    // New window
    store[clientId] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    return next();
  }
  
  // Increment count
  clientRecord.count++;
  
  if (clientRecord.count > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({
      error: "Too many requests",
      message: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute.`,
      retryAfter: Math.ceil((clientRecord.resetTime - now) / 1000),
    });
    return;
  }
  
  next();
}

