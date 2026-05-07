import { tags } from "typia";

export type QuestId =
  | "CARTOGRAPHER"
  | "DIVERSIFIER"
  | "RECEIPT_READER"
  | "TIER_II";

export interface QuestProgressItem {
  questId: QuestId;
  progress: number & tags.Type<"int32"> & tags.Minimum<0>;
  target: number & tags.Type<"int32"> & tags.Minimum<1>;
  completed: boolean;
  /** i18n key, resolved client-side per Accept-Language. */
  labelKey: string;
  completedAt?: (string & tags.Format<"date-time">) | null;
}

export interface QuestState {
  forDate: string & tags.Format<"date">;
  quests: QuestProgressItem[];
}

export interface QuestCompleteResponse {
  questId: QuestId;
  completedAt: string & tags.Format<"date-time">;
  xpAwarded: number & tags.Type<"int32"> & tags.Minimum<0>;
  streak: Streak;
}

export interface Streak {
  currentDays: number & tags.Type<"int32"> & tags.Minimum<0>;
  longestDays: number & tags.Type<"int32"> & tags.Minimum<0>;
  lastTickAt?: string & tags.Format<"date-time">;
  freezeTokens?: number & tags.Type<"int32"> & tags.Minimum<0>;
}
