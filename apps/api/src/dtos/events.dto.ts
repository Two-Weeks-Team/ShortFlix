import { tags } from "typia";
import type { Problem } from "./common.dto";

export type PickEventType = "VIEW" | "SAVE" | "SHARE" | "DISMISS" | "WHY_OPENED";

export interface PickEventInput {
  /** Client-side dedup id; idempotent at the per-event level within the batch. */
  clientEventId: string & tags.Format<"uuid">;
  pickId: string;
  eventType: PickEventType;
  /** Required when eventType=VIEW. Validated by service. */
  durationMs?: number & tags.Type<"int32"> & tags.Minimum<0>;
  occurredAt?: string & tags.Format<"date-time">;
}

export interface PickEventBatchRequest {
  events: PickEventInput[] & tags.MinItems<1> & tags.MaxItems<50>;
}

export interface AcceptedPickEvent {
  clientEventId: string & tags.Format<"uuid">;
  eventId: string;
}

export interface RejectedPickEvent {
  clientEventId: string & tags.Format<"uuid">;
  error: Problem;
}

export interface PickEventBatchResponse {
  accepted: AcceptedPickEvent[];
  rejected: RejectedPickEvent[];
}
