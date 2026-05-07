import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { PickEventInput } from "../dtos/events.dto";

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Insert events and return the persisted ids in the same order as the input batch.
   * Uses createMany() for the bulk insert path; falls back to per-row create() to
   * surface field-level rejections (e.g., unknown pickId).
   */
  async insertBatch(args: { userId: string; events: PickEventInput[] }) {
    const accepted: { clientEventId: string; eventId: string }[] = [];
    const rejected: { clientEventId: string; reason: string }[] = [];

    for (const e of args.events) {
      try {
        const row = await this.prisma.pickEvent.create({
          data: {
            userId: args.userId,
            pickId: e.pickId,
            eventType: e.eventType,
            occurredAt: e.occurredAt ? new Date(e.occurredAt) : new Date(),
            durationMs: e.durationMs,
          },
        });
        accepted.push({ clientEventId: e.clientEventId, eventId: row.id });
      } catch (err) {
        rejected.push({ clientEventId: e.clientEventId, reason: (err as Error).message });
      }
    }
    return { accepted, rejected };
  }
}
