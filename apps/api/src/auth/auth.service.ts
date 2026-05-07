import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleOAuthService, type GoogleClaims } from "./google-oauth.service";
import { JwtService } from "./jwt.service";
import { DEFAULT_USER_SCOPES, type Scope } from "./scopes";
import type { GoogleAuthRequest, SessionResponse } from "../dtos/auth.dto";

/**
 * Auth service. Owns:
 *   - Google PKCE code exchange.
 *   - User upsert (privacy-minimal — no email/picture stored).
 *   - JWT mint + revocation list (jti).
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly google: GoogleOAuthService,
    private readonly jwt: JwtService,
  ) {}

  async login(req: GoogleAuthRequest): Promise<{
    cookieValue: string;
    expiresAt: Date;
    response: SessionResponse;
  }> {
    const claims: GoogleClaims = await this.google.exchange(
      req.code,
      req.codeVerifier,
      req.redirectUri,
    );

    // Upsert in a single transaction so first-time user creation is atomic.
    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { googleSubId: claims.sub } });
      if (existing) {
        return tx.user.update({
          where: { id: existing.id },
          data: { lastSeenAt: new Date(), displayName: claims.displayName, locale: claims.locale },
        });
      }
      return tx.user.create({
        data: {
          googleSubId: claims.sub,
          displayName: claims.displayName,
          locale: claims.locale,
        },
      });
    });

    const scopes: Scope[] = [...DEFAULT_USER_SCOPES];
    const { token, expiresAt } = this.jwt.sign(user.id, scopes);

    return {
      cookieValue: token,
      expiresAt,
      response: {
        user: {
          id: user.id,
          displayName: user.displayName,
          locale: user.locale,
          preferredLangs: user.preferredLangs ? user.preferredLangs.split(",") : ["en"],
        },
        expiresAt: expiresAt.toISOString(),
        scopes,
      },
    };
  }

  /** Logout is a no-op at the data layer for now (JWT is stateless). A future
   *  revocation list keyed on jti can be added when refresh tokens land. */
  async logout(): Promise<void> {
    return;
  }
}
