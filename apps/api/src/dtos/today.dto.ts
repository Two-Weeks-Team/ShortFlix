import { tags } from "typia";

export type Platform = "YOUTUBE_SHORTS" | "INSTAGRAM_REELS" | "TIKTOK";

/**
 * One of the 9 cards in an Issue. `altText` is REQUIRED — a11y rule from spec-critic-a11y;
 * also enforced by Prisma NOT NULL.
 */
export interface Pick {
  id: string;
  position: number & tags.Type<"int32"> & tags.Minimum<1> & tags.Maximum<9>;
  platform: Platform;
  videoUrl: string & tags.Format<"uri">;
  thumbnailUrl: string & tags.Format<"uri">;
  durationSec: number & tags.Type<"int32"> & tags.Minimum<1> & tags.Maximum<600>;
  /** ISO 3166-1 alpha-2 of the content's apparent origin. */
  region: string & tags.MinLength<2> & tags.MaxLength<2>;
  /** BCP-47 of the spoken/text content of the video. */
  sourceLang: string;
  /** BCP-47 of provided captions; null if none. */
  captionLang?: string | null;
  altText: string & tags.MinLength<1> & tags.MaxLength<500>;
  blurb: string & tags.MinLength<1> & tags.MaxLength<800>;
  rationale: string & tags.MinLength<1> & tags.MaxLength<280>;
  noveltyScore: number & tags.Minimum<0> & tags.Maximum<1>;
  trendSafetyTags?: string[];
  agentTraceId?: string | null;
}

export interface Issue {
  id: string;
  issueDate: string & tags.Format<"date">;
  locale: string;
  etag: string;
  publishedAt: string & tags.Format<"date-time">;
  noveltyScore: number & tags.Minimum<0> & tags.Maximum<1>;
  /** Exactly nine picks per spec lock. */
  picks: Pick[] & tags.MinItems<9> & tags.MaxItems<9>;
}

export interface IssuePage {
  items: Issue[];
  nextCursor?: string | null;
}
