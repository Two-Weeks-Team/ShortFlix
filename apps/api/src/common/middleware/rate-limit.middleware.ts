import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { ProblemException } from "../problem";

/**
 * Token-bucket rate limiter. In production the spec calls for a Redis-backed bucket;
 * locally we use an in-memory map keyed by `userId | ip`.
 *
 * Limits per SPEC.md §3:
 *   - 60 req/min per user for read endpoints
 *   - 10 req/min per user for /api/search
 *
 * The actual per-route quota is applied via the `RouteQuota` map below; the gateway
 * uses the most restrictive matching prefix.
 */
type Bucket = { tokens: number; resetAt: number };

const ROUTE_QUOTA: { prefix: string; limit: number; windowSec: number }[] = [
  { prefix: "/api/search", limit: 10, windowSec: 60 },
  { prefix: "/api/", limit: 60, windowSec: 60 },
];

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, Bucket>();

  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.originalUrl.split("?")[0];
    const route = ROUTE_QUOTA.find((r) => path.startsWith(r.prefix));
    if (!route) return next();

    // Identify the caller. Auth guard sets req.user; otherwise fall back to IP.
    const callerId =
      (req as Request & { user?: { sub: string } }).user?.sub ?? req.ip ?? "anon";
    const bucketKey = `${route.prefix}|${callerId}`;
    const now = Date.now();
    const windowMs = route.windowSec * 1000;

    let bucket = this.buckets.get(bucketKey);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { tokens: route.limit, resetAt: now + windowMs };
      this.buckets.set(bucketKey, bucket);
    }

    if (bucket.tokens <= 0) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("RateLimit-Limit", String(route.limit));
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("RateLimit-Reset", String(retryAfter));
      res.setHeader("Retry-After", String(retryAfter));
      throw new ProblemException("rate-limited", {
        detail: `Limit ${route.limit}/${route.windowSec}s exceeded for ${route.prefix}`,
      });
    }

    bucket.tokens -= 1;
    res.setHeader("RateLimit-Limit", String(route.limit));
    res.setHeader("RateLimit-Remaining", String(bucket.tokens));
    res.setHeader(
      "RateLimit-Reset",
      String(Math.ceil((bucket.resetAt - now) / 1000)),
    );
    next();
  }
}
