import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function getClientId(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientId(req);
  const now = Date.now();
  
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
  
  const clientRecord = store[clientId];
  
  if (!clientRecord || clientRecord.resetTime < now) {
    store[clientId] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    return next();
  }
  
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

