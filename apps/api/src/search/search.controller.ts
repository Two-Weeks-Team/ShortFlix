import { TypedBody, TypedRoute } from "@nestia/core";
import { Controller, Headers, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { RequireScopes } from "../auth/auth.guard";
import { IdempotencyService } from "../auth/idempotency.service";
import type { SearchRequest, SearchResponse } from "../dtos/search.dto";
import { SearchService } from "./search.service";

@Controller("api/search")
export class SearchController {
  constructor(
    private readonly search: SearchService,
    private readonly idem: IdempotencyService,
  ) {}

  @RequireScopes("read:search")
  @TypedRoute.Post()
  async searchUnified(
    @TypedBody() body: SearchRequest,
    @Headers("accept-language") acceptLanguage: string | undefined,
    @Headers("idempotency-key") idemKey: string | undefined,
    @Headers("traceparent") traceparent: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SearchResponse> {
    const userId = req.user!.sub;
    const lang = acceptLanguage ?? "en";

    const requestHash = this.idem.computeHash("POST", "/api/search", body);
    if (idemKey) {
      const hit = await this.idem.lookup(idemKey, userId, requestHash);
      if (hit.replay) {
        res.status(hit.status);
        return hit.body as SearchResponse;
      }
    }

    const response = await this.search.search({
      userId,
      body,
      acceptLanguage: lang,
      traceparent,
    });

    if (idemKey) {
      await this.idem.record({
        key: idemKey,
        userId,
        method: "POST",
        path: "/api/search",
        requestHash,
        responseCode: 200,
        responseBody: response,
      });
    }
    return response;
  }
}
