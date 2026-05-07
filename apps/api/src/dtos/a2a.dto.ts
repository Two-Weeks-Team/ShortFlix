import { tags } from "typia";
import type { Problem } from "./common.dto";

export type A2ATargetAgent = "CURATOR" | "UNIFIED_SEARCH" | "TREND_SAFETY";

export interface A2ADispatchRequest {
  toAgent: A2ATargetAgent;
  /** RPC method name (e.g. "curator.rank", "unified_search.plan"). */
  rpc: string;
  /** RPC-specific payload (open schema by design). */
  payload: Record<string, unknown>;
  deadlineMs?: number & tags.Type<"int32"> & tags.Minimum<100> & tags.Maximum<60000>;
}

export interface A2AResponse {
  status: "ok" | "err" | "timeout";
  result?: Record<string, unknown> | null;
  error?: Problem | null;
  traceId: string;
}
