import { TypedBody, TypedRoute } from "@nestia/core";
import { Controller, Headers, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { RequireScopes } from "../auth/auth.guard";
import { IdempotencyService } from "../auth/idempotency.service";
import type {
  PickEventBatchRequest,
  PickEventBatchResponse,
} from "../dtos/events.dto";
import { EventsService } from "./events.service";

@Controller("api/events")
export class EventsController {
  constructor(
    private readonly events: EventsService,
    private readonly idem: IdempotencyService,
  ) {}

  @RequireScopes("write:event")
  @TypedRoute.Post("picks")
  async recordPickEvents(
    @TypedBody() body: PickEventBatchRequest,
    @Headers("idempotency-key") idemKey: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PickEventBatchResponse> {
    const userId = req.user!.sub;
    const requestHash = this.idem.computeHash("POST", "/api/events/picks", body);
    if (idemKey) {
      const hit = await this.idem.lookup(idemKey, userId, requestHash);
      if (hit.replay) {
        res.status(hit.status);
        return hit.body as PickEventBatchResponse;
      }
    }
    const response = await this.events.record(userId, body);
    res.status(202);
    if (idemKey) {
      await this.idem.record({
        key: idemKey,
        userId,
        method: "POST",
        path: "/api/events/picks",
        requestHash,
        responseCode: 202,
        responseBody: response,
      });
    }
    return response;
  }
}
