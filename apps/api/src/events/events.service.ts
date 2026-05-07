import { Injectable } from "@nestjs/common";
import { ProblemException, PROBLEM_URI } from "../common/problem";
import type {
  PickEventBatchRequest,
  PickEventBatchResponse,
} from "../dtos/events.dto";
import { EventsRepository } from "./events.repository";

@Injectable()
export class EventsService {
  constructor(private readonly repo: EventsRepository) {}

  async record(userId: string, body: PickEventBatchRequest): Promise<PickEventBatchResponse> {
    // Validate VIEW events carry durationMs (per OpenAPI description).
    for (const e of body.events) {
      if (e.eventType === "VIEW" && e.durationMs === undefined) {
        throw new ProblemException("validation", {
          detail: "durationMs is required for VIEW events",
          errors: [{ field: "durationMs", message: "required when eventType=VIEW", code: "required" }],
        });
      }
    }

    const { accepted, rejected } = await this.repo.insertBatch({ userId, events: body.events });
    return {
      accepted,
      rejected: rejected.map((r) => ({
        clientEventId: r.clientEventId as PickEventBatchResponse["rejected"][number]["clientEventId"],
        error: {
          type: `${PROBLEM_URI}/validation`,
          title: "Event Rejected",
          status: 422,
          detail: r.reason,
        },
      })),
    };
  }
}
