import { Injectable } from "@nestjs/common";
import { A2AClientService } from "../a2a/a2a-client.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProblemException } from "../common/problem";
import type { SearchRequest, SearchResponse, SearchResult } from "../dtos/search.dto";

/**
 * Search service. Plans + executes against the unified-search agent (Python).
 *
 * Flow:
 *   1. POST /a2a/dispatch { toAgent: UNIFIED_SEARCH, rpc: "unified_search.plan" } → plan
 *   2. POST /a2a/dispatch { toAgent: UNIFIED_SEARCH, rpc: "unified_search.execute", payload: { planId } } → results
 *   3. Persist SearchQuery + SearchResult rows for analytics + cache.
 *
 * Until the Python agent is online the gateway returns 503.
 */
@Injectable()
export class SearchService {
  constructor(
    private readonly a2a: A2AClientService,
    private readonly prisma: PrismaService,
  ) {}

  async search(args: {
    userId: string;
    body: SearchRequest;
    acceptLanguage: string;
    traceparent?: string;
  }): Promise<SearchResponse> {
    const planResp = await this.a2a.dispatchTo(
      "UNIFIED_SEARCH",
      "unified_search.plan",
      {
        rawQuery: args.body.query,
        acceptLang: args.acceptLanguage,
        languages: args.body.languages ?? [],
      },
      { traceparent: args.traceparent },
    );
    if (planResp.status !== "ok" || !planResp.result) {
      throw new ProblemException("service-unavailable", {
        detail: `unified-search.plan failed: status=${planResp.status}`,
        traceId: planResp.traceId,
      });
    }

    const planId =
      (planResp.result as { planId?: unknown }).planId ?? null;
    if (typeof planId !== "string") {
      throw new ProblemException("service-unavailable", {
        detail: "unified-search.plan returned no planId",
        traceId: planResp.traceId,
      });
    }

    const execResp = await this.a2a.dispatchTo(
      "UNIFIED_SEARCH",
      "unified_search.execute",
      { planId },
      { traceparent: args.traceparent },
    );
    if (execResp.status !== "ok" || !execResp.result) {
      throw new ProblemException("service-unavailable", {
        detail: `unified-search.execute failed: status=${execResp.status}`,
        traceId: execResp.traceId,
      });
    }

    const queryPlan = (planResp.result as { queryPlan?: unknown }).queryPlan;
    const results = (execResp.result as { results?: unknown }).results;
    if (!isQueryPlan(queryPlan) || !Array.isArray(results)) {
      throw new ProblemException("service-unavailable", {
        detail: "unified-search returned malformed payload",
      });
    }
    const typedResults = results.filter(isSearchResult);

    // Persist for analytics (do not block the response on this).
    await this.prisma.searchQuery.create({
      data: {
        userId: args.userId,
        rawQuery: args.body.query,
        acceptLang: args.acceptLanguage,
        queryPlan: JSON.stringify(queryPlan),
        resultCount: typedResults.length,
        agentTrace: execResp.traceId,
        results: {
          create: typedResults.slice(0, 30).map((r, idx) => ({
            platform: r.platform,
            videoExternalId: extractExternalId(r.videoUrl),
            videoUrl: r.videoUrl,
            thumbnailUrl: r.thumbnailUrl,
            title: r.title,
            altText: r.altText,
            sourceLang: r.sourceLang,
            rank: r.rank ?? idx + 1,
          })),
        },
      },
    });

    return {
      queryPlan,
      results: typedResults,
      agentTraceId: execResp.traceId,
    };
  }
}

function isQueryPlan(v: unknown): v is { youtube: string; instagram: string; tiktok: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).youtube === "string" &&
    typeof (v as Record<string, unknown>).instagram === "string" &&
    typeof (v as Record<string, unknown>).tiktok === "string"
  );
}

function isSearchResult(v: unknown): v is SearchResult {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.platform === "string" &&
    typeof r.videoUrl === "string" &&
    typeof r.thumbnailUrl === "string" &&
    typeof r.title === "string" &&
    typeof r.altText === "string" &&
    typeof r.sourceLang === "string" &&
    typeof r.rank === "number"
  );
}

function extractExternalId(url: string): string {
  const m = url.match(/[?&]v=([^&]+)/) ?? url.match(/\/([^/?#]+)\/?$/);
  return m?.[1] ?? url.slice(0, 64);
}
