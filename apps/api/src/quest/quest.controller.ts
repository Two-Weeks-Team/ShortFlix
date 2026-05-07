import { TypedParam, TypedRoute } from "@nestia/core";
import { Controller, Headers, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { RequireScopes } from "../auth/auth.guard";
import { IdempotencyService } from "../auth/idempotency.service";
import type {
  QuestCompleteResponse,
  QuestId,
  QuestProgressItem,
  QuestState,
  Streak,
} from "../dtos/quest.dto";
import { QuestService } from "./quest.service";

@Controller("api")
export class QuestController {
  constructor(
    private readonly quests: QuestService,
    private readonly idem: IdempotencyService,
  ) {}

  /** GET /api/quests — full quest set for today. */
  @RequireScopes("read:today")
  @TypedRoute.Get("quests")
  async listQuestState(@Req() req: Request): Promise<QuestState> {
    return this.quests.listToday(req.user!.sub);
  }

  /** GET /api/quests/{questId} — single quest state. */
  @RequireScopes("read:today")
  @TypedRoute.Get("quests/:questId")
  async getQuest(
    @TypedParam("questId") questId: QuestId,
    @Req() req: Request,
  ): Promise<QuestProgressItem> {
    return this.quests.getOne(req.user!.sub, questId);
  }

  /** POST /api/quests/{questId}/completions — REST-canonical completion. */
  @RequireScopes("write:quest")
  @TypedRoute.Post("quests/:questId/completions")
  async createQuestCompletion(
    @TypedParam("questId") questId: QuestId,
    @Headers("idempotency-key") idemKey: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<QuestCompleteResponse> {
    const userId = req.user!.sub;
    const path = `/api/quests/${questId}/completions`;
    const requestHash = this.idem.computeHash("POST", path, {});

    if (idemKey) {
      const hit = await this.idem.lookup(idemKey, userId, requestHash);
      if (hit.replay) {
        res.status(hit.status);
        return hit.body as QuestCompleteResponse;
      }
    }

    const response = await this.quests.complete(userId, questId);
    res.status(201);
    res.setHeader("Location", `/api/quests/${questId}/completions/${response.completedAt}`);

    if (idemKey) {
      await this.idem.record({
        key: idemKey,
        userId,
        method: "POST",
        path,
        requestHash,
        responseCode: 201,
        responseBody: response,
      });
    }
    return response;
  }

  /** GET /api/streak — user's streak state. */
  @RequireScopes("read:today")
  @TypedRoute.Get("streak")
  async getStreak(@Req() req: Request): Promise<Streak> {
    return this.quests.getStreak(req.user!.sub);
  }
}
