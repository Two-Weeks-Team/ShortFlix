"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api, ApiError } from "./api";
import {
  FALLBACK_ABLATION,
  FALLBACK_ISSUE,
  FALLBACK_QUESTS,
  FALLBACK_STREAK,
} from "./fixtures";
import type { AblationResponse, Issue, QuestState, Streak } from "./types";

const FALLBACK_FLAG = process.env.NEXT_PUBLIC_USE_FIXTURES === "1";

async function withFallback<T>(p: Promise<T>, fb: T): Promise<T> {
  if (FALLBACK_FLAG) return fb;
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status >= 500) return fb;
    if (
      typeof window !== "undefined" &&
      navigator &&
      navigator.onLine === false
    ) {
      return fb;
    }
    throw e;
  }
}

export function useTodayIssue() {
  return useQuery<Issue>({
    queryKey: ["today"],
    queryFn: () => withFallback(api.getTodayIssue(), FALLBACK_ISSUE),
  });
}

export function useAblation(issueDate?: string) {
  return useQuery<AblationResponse>({
    queryKey: ["ablation", issueDate ?? "latest"],
    queryFn: () =>
      withFallback(api.getAblation(issueDate), FALLBACK_ABLATION),
  });
}

export function useQuests() {
  return useQuery<QuestState>({
    queryKey: ["quests"],
    queryFn: () => withFallback(api.getQuests(), FALLBACK_QUESTS),
  });
}

export function useStreak() {
  return useQuery<Streak>({
    queryKey: ["streak"],
    queryFn: () => withFallback(api.getStreak(), FALLBACK_STREAK),
  });
}

export function useCompleteQuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questId: string) => api.completeQuest(questId),
    // Optimistic: flip `completed` immediately, rollback on error.
    onMutate: async (questId) => {
      await qc.cancelQueries({ queryKey: ["quests"] });
      const prev = qc.getQueryData<QuestState>(["quests"]);
      if (prev) {
        qc.setQueryData<QuestState>(["quests"], {
          ...prev,
          quests: prev.quests.map((q) =>
            q.questId === questId
              ? { ...q, completed: true, progress: q.target }
              : q
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["quests"], ctx.prev);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["streak"] });
      qc.invalidateQueries({ queryKey: ["quests"] });
    },
  });
}
