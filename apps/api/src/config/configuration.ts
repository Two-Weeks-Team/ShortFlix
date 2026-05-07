/**
 * Centralized typed config. All env vars are funneled here so the rest of the app
 * never reaches into process.env directly (testability + traceability).
 */
export interface AppConfig {
  port: number;
  nodeEnv: "development" | "production" | "test";
  jwt: {
    alg: "HS256" | "RS256";
    secret: string;
    issuer: string;
    audience: string;
    ttlSeconds: number;
  };
  cookie: {
    name: string;
    sameSite: "lax" | "strict" | "none";
    secure: boolean;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  agents: {
    orchestratorBaseUrl: string;
    curatorBaseUrl: string;
    unifiedSearchBaseUrl: string;
    trendSafetyBaseUrl: string;
  };
  mcp: {
    ytShortsBaseUrl: string;
    igReelsBaseUrl: string;
    tiktokBaseUrl: string;
  };
  serviceAccount: {
    audience: string;
    token: string;
  };
}

export const loadConfig = (): AppConfig => ({
  port: Number(process.env.PORT ?? 8081),
  nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development",
  jwt: {
    alg: (process.env.JWT_ALG as AppConfig["jwt"]["alg"]) ?? "HS256",
    secret: process.env.JWT_SECRET ?? "local-dev-only-replace-me-32bytes-min",
    issuer: process.env.JWT_ISSUER ?? "shortflix",
    audience: process.env.JWT_AUDIENCE ?? "shortflix-pwa",
    ttlSeconds: Number(process.env.JWT_TTL_SECONDS ?? 60 * 60 * 24 * 30),
  },
  cookie: {
    name: process.env.SESSION_COOKIE_NAME ?? "sf_session",
    sameSite: (process.env.SESSION_COOKIE_SAMESITE as AppConfig["cookie"]["sameSite"]) ?? "lax",
    secure: (process.env.SESSION_COOKIE_SECURE ?? "false").toLowerCase() === "true",
  },
  google: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "http://localhost:3000/auth/callback",
  },
  agents: {
    orchestratorBaseUrl: process.env.ORCHESTRATOR_BASE_URL ?? "http://localhost:8081",
    curatorBaseUrl: process.env.CURATOR_BASE_URL ?? "http://localhost:8082",
    unifiedSearchBaseUrl: process.env.UNIFIED_SEARCH_BASE_URL ?? "http://localhost:8083",
    trendSafetyBaseUrl: process.env.TREND_SAFETY_BASE_URL ?? "http://localhost:8084",
  },
  mcp: {
    ytShortsBaseUrl: process.env.YT_SHORTS_MCP_BASE_URL ?? "http://localhost:8091",
    igReelsBaseUrl: process.env.IG_REELS_MCP_BASE_URL ?? "http://localhost:8092",
    tiktokBaseUrl: process.env.TIKTOK_MCP_BASE_URL ?? "http://localhost:8093",
  },
  serviceAccount: {
    audience: process.env.SERVICE_ACCOUNT_AUDIENCE ?? "local-dev",
    token: process.env.SERVICE_ACCOUNT_TOKEN ?? "local-dev-token",
  },
});
