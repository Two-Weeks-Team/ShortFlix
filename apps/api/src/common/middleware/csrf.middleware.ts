import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { ProblemException } from "../problem";

/**
 * CSRF defense per SPEC.md §11: same-origin + SameSite=Lax + custom header
 * `X-Requested-With: XMLHttpRequest` required on state-mutating requests when the
 * caller used the cookie auth path.
 *
 * Bearer-token requests (server-to-server / SDK) skip this check.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const method = req.method.toUpperCase();
    if (method !== "POST" && method !== "PUT" && method !== "PATCH" && method !== "DELETE") {
      return next();
    }
    // Skip for Bearer-token clients.
    const auth = req.headers["authorization"];
    if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
      return next();
    }
    // Skip for service-to-service routes (carry their own auth).
    if (req.originalUrl.startsWith("/a2a/") || req.originalUrl.startsWith("/mcp/")) {
      return next();
    }
    const xrw = req.headers["x-requested-with"];
    if (xrw !== "XMLHttpRequest") {
      throw new ProblemException("forbidden", {
        detail: "Missing X-Requested-With header on cookie-authed mutation",
      });
    }
    next();
  }
}
