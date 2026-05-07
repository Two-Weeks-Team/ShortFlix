import { Injectable } from "@nestjs/common";
import { ProblemException } from "../common/problem";
import type {
  QuestCompleteResponse,
  QuestId,
  QuestProgressItem,
  QuestState,
  Streak,
} from "../dtos/quest.dto";
import { QuestRepository } from "./quest.repository";

const ALL_QUESTS: QuestId[] = ["CARTOGRAPHER", "DIVERSIFIER", "RECEIPT_READER", "TIER_II"];

const LABELS: Record<QuestId, string> = {
  CARTOGRAPHER: "quest.cartographer.label",
  DIVERSIFIER: "quest.diversifier.label",
  RECEIPT_READER: "quest.receipt_reader.label",
  TIER_II: "quest.tier_ii.label",
};

@Injectable()
export class QuestService {
  constructor(private readonly repo: QuestRepository) {}

  async listToday(userId: string): Promise<QuestState> {
    const forDate = todayUtc();
    const rows = await this.repo.listForToday(userId, forDate);
    const byId = new Map(rows.map((r) => [r.questId, r]));
    const quests: QuestProgressItem[] = ALL_QUESTS.map((q) => {
      const row = byId.get(q);
      return {
        questId: q,
        progress: row?.progress ?? 0,
        target: row?.target ?? defaultTarget(q),
        completed: !!row?.completedAt,
        labelKey: LABELS[q],
        completedAt: row?.completedAt?.toISOString() ?? null,
      };
    });
    return {
      forDate: forDate.toISOString().slice(0, 10),
      quests,
    };
  }

  async getOne(userId: string, questId: QuestId): Promise<QuestProgressItem> {
    const forDate = todayUtc();
    const row = await this.repo.getOne(userId, questId, forDate);
    if (!row) {
      return {
        questId,
        progress: 0,
        target: defaultTarget(questId),
        completed: false,
        labelKey: LABELS[questId],
        completedAt: null,
      };
    }
    return {
      questId,
      progress: row.progress,
      target: row.target,
      completed: !!row.completedAt,
      labelKey: LABELS[questId],
      completedAt: row.completedAt?.toISOString() ?? null,
    };
  }

  async getStreak(userId: string): Promise<Streak> {
    const row = await this.repo.getStreak(userId);
    return {
      currentDays: row?.currentDays ?? 0,
      longestDays: row?.longestDays ?? 0,
      lastTickAt: row?.lastTickAt?.toISOString(),
      freezeTokens: row?.freezeTokens ?? 0,
    };
  }

  async complete(userId: string, questId: QuestId): Promise<QuestCompleteResponse> {
    const forDate = todayUtc();
    let result;
    try {
      result = await this.repo.completeAtomic({ userId, questId, forDate });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === "quest-already-completed") {
        throw new ProblemException("quest-already-completed", {
          detail: `Quest ${questId} already completed for today`,
        });
      }
      if (msg === "quest-progress-insufficient") {
        throw new ProblemException("quest-progress-insufficient", {
          detail: `progress < target for ${questId}`,
        });
      }
      if (msg === "quest-not-initialized") {
        throw new ProblemException("not-found", {
          detail: `Quest ${questId} has no progress row for today`,
        });
      }
      throw err;
    }
    const streakRow = await this.repo.upsertStreakTick(userId);
    return {
      questId,
      completedAt: result.completion.completedAt!.toISOString(),
      xpAwarded: result.xpAwarded,
      streak: {
        currentDays: streakRow.currentDays,
        longestDays: streakRow.longestDays,
        lastTickAt: streakRow.lastTickAt.toISOString(),
        freezeTokens: streakRow.freezeTokens,
      },
    };
  }
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function defaultTarget(q: QuestId): number {
  switch (q) {
    case "CARTOGRAPHER":
      return 5;
    case "DIVERSIFIER":
      return 3;
    case "RECEIPT_READER":
      return 3;
    case "TIER_II":
      return 100;
  }
}
