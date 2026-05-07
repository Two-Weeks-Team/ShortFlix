import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

/**
 * Sets the security headers required by SPEC.md §3:
 *   HSTS, CSP, Referrer-Policy, X-Content-Type-Options, Permissions-Policy.
 *
 * helmet() is also applied at bootstrap; this middleware enforces the bespoke CSP
 * for the api.shortflix.run.app origin.
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self' https://api.shortflix.run.app; frame-ancestors 'none'",
    );
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    );
    next();
  }
}
