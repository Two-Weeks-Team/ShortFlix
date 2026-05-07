import { tags } from "typia";

export type AgentName =
  | "ORCHESTRATOR"
  | "CURATOR"
  | "UNIFIED_SEARCH"
  | "TREND_SAFETY";

export interface AblationRow {
  droppedAgent: AgentName;
  noveltyScore: number & tags.Minimum<0> & tags.Maximum<1>;
  pickOverlap: number & tags.Minimum<0> & tags.Maximum<1>;
}

export interface AblationResponse {
  issueDate: string & tags.Format<"date">;
  baselineNovelty: number & tags.Minimum<0> & tags.Maximum<1>;
  /** Exactly four rows — one per dropped agent (MD-01). */
  rows: AblationRow[] & tags.MinItems<4> & tags.MaxItems<4>;
}
