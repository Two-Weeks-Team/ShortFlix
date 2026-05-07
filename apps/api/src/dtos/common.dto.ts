/**
 * Cross-cutting DTOs (RFC 7807 Problem, paging, etc.).
 * typia tags only — class-validator is forbidden by the SuperClaude framework rule
 * and by the BE_LEAD scope contract.
 */
import { tags } from "typia";

/** RFC 7807 application/problem+json envelope. Mirrors openapi.yaml#/components/schemas/Problem. */
export interface Problem {
  type: string & tags.Format<"uri">;
  title: string;
  status: number & tags.Type<"int32">;
  detail?: string;
  instance?: string & tags.Format<"uri">;
  traceId?: string;
  /** BCP-47 locale that title/detail were rendered in. */
  lang?: string;
  errors?: ProblemFieldError[];
}

export interface ProblemFieldError {
  field: string;
  message: string;
  code?: string;
}

/** Health envelope (orchestrator + per-service). */
export interface Health {
  service: string;
  status: "ok" | "degraded" | "down";
  version: string;
  commitSha?: string;
  uptimeSec?: number & tags.Type<"int32"> & tags.Minimum<0>;
}

/**
 * Service enum for /api/health/{service}.
 * Mirrors the openapi.yaml inline enum so the controller can use a single TypedParam.
 */
export type ServiceName =
  | "orchestrator"
  | "curator"
  | "unified-search"
  | "trend-safety"
  | "yt-shorts-mcp"
  | "ig-reels-mcp"
  | "tiktok-mcp";
