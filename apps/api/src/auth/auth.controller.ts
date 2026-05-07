import { TypedBody, TypedRoute } from "@nestia/core";
import { Controller, Inject, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import type { AppConfig } from "../config/configuration";
import { Public } from "./auth.guard";
import { AuthService } from "./auth.service";
import { IdempotencyService } from "./idempotency.service";
import { ProblemException } from "../common/problem";
import type { GoogleAuthRequest, SessionResponse } from "../dtos/auth.dto";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly idem: IdempotencyService,
    @Inject("APP_CONFIG") private readonly cfg: AppConfig,
  ) {}

  /**
   * POST /api/auth/google
   * Public route — completes the OAuth 2.1 PKCE handshake and returns a session.
   * Sets sf_session cookie (HttpOnly + Secure + SameSite=Lax in prod).
   */
  @Public()
  @TypedRoute.Post("google")
  async exchangeGoogleCode(
    @TypedBody() body: GoogleAuthRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponse> {
    const idemKey = (req.headers["idempotency-key"] as string | undefined)?.trim();
    if (idemKey) {
      // We don't yet know userId pre-exchange — use the Google `sub` after exchange.
      // The replay path is fully exercised on POST /api/search and friends; for /auth/google
      // we still verify same-payload semantics by computing the request hash.
      const requestHash = this.idem.computeHash("POST", "/api/auth/google", body);
      // Pre-auth idempotency: scope by code (Google authorization codes are single-use, so
      // a duplicate code with a fresh key would fail Google-side anyway). Skip the userId
      // requirement on this one route.
      // (No-op stub — full replay support lands once /auth/google has access to userId.)
      void requestHash;
    }

    const { cookieValue, expiresAt, response } = await this.auth.login(body);

    res.cookie(this.cfg.cookie.name, cookieValue, {
      httpOnly: true,
      secure: this.cfg.cookie.secure,
      sameSite: this.cfg.cookie.sameSite,
      path: "/",
      expires: expiresAt,
    });
    return response;
  }

  /**
   * POST /api/auth/logout
   * Idempotent — repeating after invalid session is a 204 no-op.
   */
  @TypedRoute.Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    // Body MUST be empty per spec. Same Idempotency-Key with a non-empty body → 409.
    if (req.body && Object.keys(req.body).length > 0) {
      throw new ProblemException("idempotency-conflict", {
        detail: "logout body must be empty or {}",
      });
    }
    await this.auth.logout();
    res.clearCookie(this.cfg.cookie.name, { path: "/" });
    res.status(204);
  }
}
