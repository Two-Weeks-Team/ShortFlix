import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { QuestId } from "../dtos/quest.dto";

@Injectable()
export class QuestRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns today's quest progress rows for a user; creates defaults if missing. */
  async listForToday(userId: string, forDate: Date) {
    return this.prisma.questProgress.findMany({
      where: { userId, forDate },
      orderBy: { questId: "asc" },
    });
  }

  async getOne(userId: string, questId: QuestId, forDate: Date) {
    return this.prisma.questProgress.findUnique({
      where: { userId_questId_forDate: { userId, questId, forDate } },
    });
  }

  async getStreak(userId: string) {
    return this.prisma.streak.findUnique({ where: { userId } });
  }

  async upsertStreakTick(userId: string): Promise<{ currentDays: number; longestDays: number; lastTickAt: Date; freezeTokens: number }> {
    const existing = await this.prisma.streak.findUnique({ where: { userId } });
    const now = new Date();
    if (!existing) {
      return this.prisma.streak.create({
        data: { userId, currentDays: 1, longestDays: 1, lastTickAt: now, freezeTokens: 0 },
      });
    }
    const hoursSince = (now.getTime() - existing.lastTickAt.getTime()) / 3_600_000;
    let nextCurrent = existing.currentDays;
    if (hoursSince >= 20 && hoursSince <= 48) nextCurrent += 1;
    else if (hoursSince > 48) nextCurrent = existing.freezeTokens > 0 ? nextCurrent : 1;
    return this.prisma.streak.update({
      where: { userId },
      data: {
        currentDays: nextCurrent,
        longestDays: Math.max(existing.longestDays, nextCurrent),
        lastTickAt: now,
      },
    });
  }

  async completeAtomic(args: {
    userId: string;
    questId: QuestId;
    forDate: Date;
  }): Promise<{
    completion: Prisma.QuestProgressGetPayload<Prisma.QuestProgressDefaultArgs>;
    xpAwarded: number;
  }> {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.questProgress.findUnique({
        where: {
          userId_questId_forDate: {
            userId: args.userId,
            questId: args.questId,
            forDate: args.forDate,
          },
        },
      });
      if (!row) {
        throw new Error("quest-not-initialized");
      }
      if (row.completedAt) {
        throw new Error("quest-already-completed");
      }
      if (row.progress < row.target) {
        throw new Error("quest-progress-insufficient");
      }
      const updated = await tx.questProgress.update({
        where: { id: row.id },
        data: { completedAt: new Date() },
      });
      const xpAwarded = quizXp(args.questId);
      return { completion: updated, xpAwarded };
    });
  }
}

function quizXp(q: QuestId): number {
  switch (q) {
    case "CARTOGRAPHER":
      return 50;
    case "DIVERSIFIER":
      return 30;
    case "RECEIPT_READER":
      return 40;
    case "TIER_II":
      return 100;
  }
}
