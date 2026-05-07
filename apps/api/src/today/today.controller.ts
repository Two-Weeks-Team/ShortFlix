import { TypedQuery, TypedRoute, TypedParam } from "@nestia/core";
import { Controller, Headers, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { RequireScopes } from "../auth/auth.guard";
import type { Issue, IssuePage } from "../dtos/today.dto";
import { TodayService } from "./today.service";

@Controller("api/today")
export class TodayController {
  constructor(private readonly today: TodayService) {}

  /** GET /api/today — current issue with ETag/304 support. */
  @RequireScopes("read:today")
  @TypedRoute.Get()
  async getToday(
    @Headers("accept-language") acceptLang: string | undefined,
    @Headers("if-none-match") ifNoneMatch: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Issue | undefined> {
    const locale = resolveLocale(acceptLang, req.user?.sub);
    const issue = await this.today.getCurrent(locale);

    if (ifNoneMatch && ifNoneMatch === issue.etag) {
      res.status(304);
      return undefined;
    }
    res.setHeader("ETag", issue.etag);
    res.setHeader("Cache-Control", "private, max-age=120");
    res.setHeader("Content-Language", issue.locale);
    return issue;
  }

  /** GET /api/today/{date} — historical issue (cursor-paginated). */
  @RequireScopes("read:today")
  @TypedRoute.Get(":date")
  async getHistorical(
    @TypedParam("date") date: string,
    @TypedQuery() query: { cursor?: string; limit?: number },
    @Headers("accept-language") acceptLang: string | undefined,
    @Req() req: Request,
  ): Promise<IssuePage | Issue> {
    const locale = resolveLocale(acceptLang, req.user?.sub);
    const limit = clamp(query.limit ?? 1, 1, 30);
    if (query.cursor || (query.limit ?? 1) > 1) {
      return this.today.getPage({ locale, cursor: query.cursor, limit });
    }
    return this.today.getByDate(date, locale);
  }
}

function resolveLocale(acceptLang: string | undefined, _userId: string | undefined): string {
  if (!acceptLang) return "en";
  // RFC 7231 §5.3.5 — pick the highest-q tag whose primary subtag is supported.
  const supported = new Set(["en", "ko"]);
  const tokens = acceptLang
    .split(",")
    .map((t) => {
      const [tag, ...params] = t.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      return { tag: (tag ?? "").toLowerCase(), q: q ? Number(q.slice(2)) : 1.0 };
    })
    .filter((t) => t.tag.length > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tokens) {
    const primary = tag.split("-")[0]!;
    if (supported.has(primary)) return primary;
  }
  return "en";
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
