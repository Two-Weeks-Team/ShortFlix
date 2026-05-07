import { Injectable } from "@nestjs/common";
import { ProblemException } from "../common/problem";
import type { Issue, IssuePage, Pick } from "../dtos/today.dto";
import { TodayRepository } from "./today.repository";

type DbIssue = Awaited<ReturnType<TodayRepository["findCurrent"]>>;
type DbPick = NonNullable<DbIssue>["picks"][number];

/**
 * Read-side service for the daily Issue. The curator agent (Python) writes Issue+Pick
 * rows during the nightly batch; this service only reads.
 */
@Injectable()
export class TodayService {
  constructor(private readonly repo: TodayRepository) {}

  async getCurrent(locale: string): Promise<Issue> {
    const issue = await this.repo.findCurrent(locale);
    if (!issue) {
      throw new ProblemException("not-found", { detail: `No issue for locale=${locale}` });
    }
    return this.toDto(issue);
  }

  async getByDate(date: string, locale: string): Promise<Issue> {
    const issueDate = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(issueDate.getTime())) {
      throw new ProblemException("bad-request", { detail: `Invalid date: ${date}` });
    }
    const issue = await this.repo.findByDate(issueDate, locale);
    if (!issue) {
      throw new ProblemException("not-found", {
        detail: `No issue for date=${date} locale=${locale}`,
      });
    }
    return this.toDto(issue);
  }

  async getPage(args: { locale: string; cursor?: string; limit: number }): Promise<IssuePage> {
    const items = await this.repo.findPage(args);
    const nextCursor = items.length === args.limit ? items[items.length - 1]!.id : null;
    return {
      items: items.map((i) => this.toDto(i)),
      nextCursor,
    };
  }

  private toDto(issue: NonNullable<DbIssue>): Issue {
    if (issue.picks.length !== 9) {
      // Spec invariant violated — surface as 503 since it indicates upstream curator drift.
      throw new ProblemException("service-unavailable", {
        detail: `Issue ${issue.id} has ${issue.picks.length} picks (expected 9)`,
      });
    }
    return {
      id: issue.id,
      issueDate: issue.issueDate.toISOString().slice(0, 10),
      locale: issue.locale,
      etag: issue.etag,
      publishedAt: issue.publishedAt.toISOString(),
      noveltyScore: issue.noveltyScore,
      picks: issue.picks.map((p) => this.pickToDto(p)) as Issue["picks"],
    };
  }

  private pickToDto(p: DbPick): Pick {
    let trendSafetyTags: string[] = [];
    try {
      const parsed: unknown = JSON.parse(p.trendSafetyTags);
      if (Array.isArray(parsed)) trendSafetyTags = parsed.filter((t): t is string => typeof t === "string");
    } catch {
      trendSafetyTags = [];
    }
    return {
      id: p.id,
      position: p.position,
      platform: p.platform,
      videoUrl: p.videoUrl,
      thumbnailUrl: p.thumbnailUrl,
      durationSec: p.durationSec,
      region: p.region,
      sourceLang: p.sourceLang,
      captionLang: p.captionLang,
      altText: p.altText,
      blurb: p.blurb,
      rationale: p.rationale,
      noveltyScore: p.noveltyScore,
      trendSafetyTags,
      agentTraceId: p.agentTrace,
    };
  }
}
