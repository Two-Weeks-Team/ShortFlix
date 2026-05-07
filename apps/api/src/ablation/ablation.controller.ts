import { TypedQuery, TypedRoute } from "@nestia/core";
import { Controller, Headers, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { RequireScopes } from "../auth/auth.guard";
import type { AblationResponse } from "../dtos/ablation.dto";
import { AblationService } from "./ablation.service";

@Controller("api/ablation")
export class AblationController {
  constructor(private readonly ablation: AblationService) {}

  @RequireScopes("read:today")
  @TypedRoute.Get()
  async getAblation(
    @TypedQuery() query: { issueDate?: string },
    @Headers("if-none-match") ifNoneMatch: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AblationResponse | undefined> {
    const { response, etag } = await this.ablation.getForIssue({
      issueDate: query.issueDate,
      userId: req.user?.sub,
    });
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(304);
      return undefined;
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "private, max-age=300");
    return response;
  }
}
