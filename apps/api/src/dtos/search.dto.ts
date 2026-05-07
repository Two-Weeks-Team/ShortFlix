import { tags } from "typia";
import type { Platform } from "./today.dto";

export interface SearchRequest {
  query: string & tags.MinLength<1> & tags.MaxLength<280>;
  /** Optional list of BCP-47 source-language hints (capped at 5 per spec). */
  languages?: string[] & tags.MaxItems<5>;
}

export interface SearchQueryPlan {
  youtube: string;
  instagram: string;
  tiktok: string;
}

export interface SearchResult {
  platform: Platform;
  videoUrl: string & tags.Format<"uri">;
  thumbnailUrl: string & tags.Format<"uri">;
  title: string;
  /** a11y description of the result thumbnail/preview — REQUIRED. */
  altText: string & tags.MinLength<1>;
  sourceLang: string;
  rank: number & tags.Type<"int32"> & tags.Minimum<1>;
}

export interface SearchResponse {
  queryPlan: SearchQueryPlan;
  results: SearchResult[];
  agentTraceId?: string | null;
}
