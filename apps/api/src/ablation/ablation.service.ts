import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { ProblemException } from "../common/problem";
import type { AblationResponse, AblationRow, AgentName } from "../dtos/ablation.dto";
import { AblationRepository } from "./ablation.repository";

const ALL_AGENTS: AgentName[] = ["ORCHESTRATOR", "CURATOR", "UNIFIED_SEARCH", "TREND_SAFETY"];

@Injectable()
export class AblationService {
  constructor(private readonly repo: AblationRepository) {}

  async getForIssue(args: { issueDate?: string; userId?: string }): Promise<{
    response: AblationResponse;
    etag: string;
  }> {
    const issue = args.issueDate
      ? await this.repo.findIssueByDateAnyLocale(new Date(`${args.issueDate}T00:00:00Z`))
      : await this.repo.findLatestIssue();

    if (!issue) {
      throw new ProblemException("not-found", { detail: "Issue not found" });
    }
    const rawRows = await this.repo.findRowsForIssue(issue.id);
    if (rawRows.length !== 4) {
      throw new ProblemException("service-unavailable", {
        detail: `Ablation incomplete for issue ${issue.id} (have ${rawRows.length}/4 rows)`,
      });
    }
    const byAgent = new Map(rawRows.map((r) => [r.droppedAgent, r]));
    const rows: AblationRow[] = ALL_AGENTS.map((a) => {
      const row = byAgent.get(a)!;
      return {
        droppedAgent: a,
        noveltyScore: row.noveltyScore,
        pickOverlap: row.pickOverlap,
      };
    });

    await this.repo.logView({ userId: args.userId, issueId: issue.id });

    const response: AblationResponse = {
      issueDate: issue.issueDate.toISOString().slice(0, 10),
      baselineNovelty: issue.noveltyScore,
      rows: rows as AblationResponse["rows"],
    };
    const etag = `"${createHash("sha256").update(JSON.stringify(response)).digest("hex").slice(0, 16)}"`;
    return { response, etag };
  }
}
