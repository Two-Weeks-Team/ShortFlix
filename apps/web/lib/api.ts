/**
 * Typed REST client for the orchestrator service.
 *
 * Domain is lazy-bound (Gate H1) — `NEXT_PUBLIC_APP_URL` defaults to a placeholder
 * Cloud Run URL until D+25 final domain decision.
 *
 * Auth: HttpOnly cookie (`sf_session`) is sent automatically with `credentials: include`.
 * Bearer fallback for non-cookie clients is honoured via the `Authorization` header
 * when the caller passes `init.headers.Authorization`.
 *
 * When packages/sdk (nestia-generated) lands, swap this module for that import.
 */

import type {
  AblationResponse,
  Issue,
  Problem,
  QuestState,
  Streak,
} from "./types";
import { uuidv4 } from "./utils";

export const API_BASE =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://shortflix-web-PROJECT_ID.a.run.app";

export class ApiError extends Error {
  problem: Problem;
  status: number;
  constructor(problem: Problem) {
    super(problem.title || `HTTP ${problem.status}`);
    this.name = "ApiError";
    this.problem = problem;
    this.status = problem.status;
  }
}

interface RequestOpts extends Omit<RequestInit, "body"> {
  query?: Record<string, string | number | undefined>;
  json?: unknown;
  /** When true, attaches an Idempotency-Key UUID v4 header. */
  idempotent?: boolean;
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.json ? { "Content-Type": "application/json" } : {}),
    ...((opts.headers as Record<string, string>) ?? {}),
  };
  if (opts.idempotent) {
    headers["Idempotency-Key"] = uuidv4();
  }

  const res = await fetch(url.toString(), {
    ...opts,
    headers,
    credentials: "include",
    body: opts.json ? JSON.stringify(opts.json) : undefined,
  });

  if (res.status === 304) {
    // Caller is responsible for cached-state retrieval; we surface it as null.
    return null as T;
  }

  if (!res.ok) {
    let problem: Problem;
    try {
      problem = (await res.json()) as Problem;
    } catch {
      problem = {
        type: "about:blank",
        title: res.statusText || "Request failed",
        status: res.status,
      };
    }
    throw new ApiError(problem);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  health: () => request<{ status: string; version: string }>("/api/health"),

  getTodayIssue: (etag?: string) =>
    request<Issue>("/api/today", {
      headers: etag ? { "If-None-Match": etag } : undefined,
    }),

  getHistoricalIssue: (date: string) =>
    request<Issue>(`/api/today/${encodeURIComponent(date)}`),

  getQuests: () => request<QuestState>("/api/quests"),

  completeQuest: (questId: string) =>
    request<{ questId: string; xpAwarded: number; streak: Streak }>(
      `/api/quests/${encodeURIComponent(questId)}/completions`,
      { method: "POST", json: {}, idempotent: true }
    ),

  getStreak: () => request<Streak>("/api/streak"),

  getAblation: (issueDate?: string, etag?: string) =>
    request<AblationResponse>("/api/ablation", {
      query: issueDate ? { issueDate } : undefined,
      headers: etag ? { "If-None-Match": etag } : undefined,
    }),

  recordPickEvents: (
    events: Array<{
      clientEventId: string;
      pickId: string;
      eventType: "VIEW" | "SAVE" | "SHARE" | "DISMISS" | "WHY_OPENED";
      durationMs?: number;
      occurredAt?: string;
    }>
  ) =>
    request<{ accepted: unknown[]; rejected: unknown[] }>(
      "/api/events/picks",
      { method: "POST", json: { events }, idempotent: true }
    ),
};
