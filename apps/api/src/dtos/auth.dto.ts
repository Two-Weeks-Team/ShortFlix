import { tags } from "typia";

/** PKCE code-exchange envelope. Mirrors openapi.yaml#/components/schemas/GoogleAuthRequest. */
export interface GoogleAuthRequest {
  /** Authorization code from Google's redirect. */
  code: string & tags.MinLength<1> & tags.MaxLength<2048>;
  /** PKCE code_verifier the client generated at flow start (S256 challenge). */
  codeVerifier: string & tags.MinLength<43> & tags.MaxLength<128>;
  /** Must exactly match the redirect_uri used at the authorize step. */
  redirectUri: string & tags.Format<"uri">;
}

/** Response after a successful PKCE exchange. */
export interface SessionResponse {
  user: SessionUser;
  expiresAt: string & tags.Format<"date-time">;
  scopes: string[];
}

/** Privacy-minimal user payload (MD-06 — no email, no profile picture URL). */
export interface SessionUser {
  id: string;
  displayName: string;
  /** BCP-47, e.g. "en", "ko". */
  locale: string;
  preferredLangs?: string[];
}
