import { Inject, Injectable, Logger } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import type { AppConfig } from "../config/configuration";
import { ProblemException } from "../common/problem";

/**
 * Google OAuth 2.1 PKCE code-exchange. The PWA performs the redirect to
 * accounts.google.com and receives the authorization code at its `/auth/callback`;
 * it then POSTs `{ code, codeVerifier, redirectUri }` to /api/auth/google.
 *
 * On the server we:
 *   1. Exchange code (with code_verifier) → id_token + access_token.
 *   2. Verify id_token signature against Google's JWKS.
 *   3. Return the OIDC `sub`, `name`, `locale` claims (email + picture deliberately
 *      discarded per MD-06 PII minimization).
 */
export interface GoogleClaims {
  sub: string;
  displayName: string;
  locale: string;
}

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private readonly client: OAuth2Client;

  constructor(@Inject("APP_CONFIG") private readonly cfg: AppConfig) {
    this.client = new OAuth2Client(
      this.cfg.google.clientId,
      this.cfg.google.clientSecret,
      this.cfg.google.redirectUri,
    );
  }

  async exchange(code: string, codeVerifier: string, redirectUri: string): Promise<GoogleClaims> {
    if (redirectUri !== this.cfg.google.redirectUri) {
      throw new ProblemException("bad-request", {
        detail: "redirectUri mismatch with server configuration",
      });
    }

    let tokens;
    try {
      const result = await this.client.getToken({
        code,
        codeVerifier,
        redirect_uri: redirectUri,
      });
      tokens = result.tokens;
    } catch (err) {
      this.logger.warn(`Google token exchange failed: ${(err as Error).message}`);
      throw new ProblemException("unauthorized", { detail: "Code exchange failed" });
    }

    const idToken = tokens.id_token;
    if (!idToken) {
      throw new ProblemException("unauthorized", { detail: "Google did not return id_token" });
    }

    let payload;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.cfg.google.clientId,
      });
      payload = ticket.getPayload();
    } catch (err) {
      throw new ProblemException("unauthorized", {
        detail: `id_token verification failed: ${(err as Error).message}`,
      });
    }

    if (!payload || !payload.sub) {
      throw new ProblemException("unauthorized", { detail: "Empty Google claims" });
    }

    return {
      sub: payload.sub,
      displayName: payload.name ?? `User-${payload.sub.slice(0, 8)}`,
      locale: payload.locale ?? "en",
    };
  }
}
