import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AblationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findIssueByDateAnyLocale(issueDate: Date) {
    return this.prisma.issue.findFirst({ where: { issueDate }, orderBy: { revision: "desc" } });
  }

  async findLatestIssue() {
    return this.prisma.issue.findFirst({ orderBy: { issueDate: "desc" } });
  }

  async findRowsForIssue(issueId: string) {
    return this.prisma.ablationResult.findMany({ where: { issueId } });
  }

  async logView(args: { userId?: string; issueId: string }) {
    return this.prisma.ablationView.create({
      data: {
        ...(args.userId && { userId: args.userId }),
        issueId: args.issueId,
      },
    });
  }
}
