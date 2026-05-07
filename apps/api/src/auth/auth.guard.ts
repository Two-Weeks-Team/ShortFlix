import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { AppConfig } from "../config/configuration";
import { ProblemException } from "../common/problem";
import { JwtService, type SessionClaims } from "./jwt.service";
import type { Scope } from "./scopes";

export const SCOPES_KEY = "auth:scopes";
/** Decorator: declare the scopes a route requires. */
export const RequireScopes = (...scopes: Scope[]) => SetMetadata(SCOPES_KEY, scopes);

/** Decorator: opt route out of auth (public). */
export const PUBLIC_KEY = "auth:public";
export const Public = () => SetMetadata(PUBLIC_KEY, true);

declare module "express-serve-static-core" {
  interface Request {
    user?: SessionClaims;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @Inject("APP_CONFIG") private readonly cfg: AppConfig,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const required =
      this.reflector.getAllAndOverride<Scope[]>(SCOPES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? [];

    const req = ctx.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);
    if (!token) {
      throw new ProblemException("unauthorized", {
        detail: "Missing session cookie or bearer token",
      });
    }

    let claims: SessionClaims;
    try {
      claims = this.jwt.verify(token);
    } catch (err) {
      throw new ProblemException("unauthorized", {
        detail: `Invalid token: ${(err as Error).message}`,
      });
    }
    req.user = claims;

    if (required.length === 0) return true;
    const have = new Set(claims.scopes);
    const missing = required.filter((s) => !have.has(s));
    if (missing.length > 0) {
      throw new ProblemException("forbidden", {
        detail: `Insufficient scope. Missing: ${missing.join(", ")}`,
      });
    }
    return true;
  }

  private extractToken(req: Request): string | undefined {
    const auth = req.headers["authorization"];
    if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
      return auth.slice(7).trim();
    }
    const cookieHeader = req.headers["cookie"];
    if (typeof cookieHeader === "string") {
      const cookies = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .filter(Boolean);
      for (const c of cookies) {
        const [k, ...rest] = c.split("=");
        if (k === this.cfg.cookie.name) return decodeURIComponent(rest.join("="));
      }
    }
    return undefined;
  }
}
