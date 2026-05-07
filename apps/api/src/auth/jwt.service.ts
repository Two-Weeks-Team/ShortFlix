import { Inject, Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import type { AppConfig } from "../config/configuration";

export interface SessionClaims {
  sub: string;
  scopes: string[];
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Mints + verifies the session JWT. Local dev uses HS256; production switches to RS256
 * with a Cloud KMS-managed key (rotation tracked in SPEC.md §11).
 */
@Injectable()
export class JwtService {
  constructor(@Inject("APP_CONFIG") private readonly cfg: AppConfig) {}

  sign(sub: string, scopes: string[]): { token: string; expiresAt: Date; jti: string } {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.cfg.jwt.ttlSeconds;
    const jti = randomUUID();
    const payload: SessionClaims = {
      sub,
      scopes,
      jti,
      iat: now,
      exp,
      iss: this.cfg.jwt.issuer,
      aud: this.cfg.jwt.audience,
    };
    const token = jwt.sign(payload, this.cfg.jwt.secret, { algorithm: this.cfg.jwt.alg });
    return { token, expiresAt: new Date(exp * 1000), jti };
  }

  verify(token: string): SessionClaims {
    return jwt.verify(token, this.cfg.jwt.secret, {
      algorithms: [this.cfg.jwt.alg],
      issuer: this.cfg.jwt.issuer,
      audience: this.cfg.jwt.audience,
    }) as SessionClaims;
  }
}
