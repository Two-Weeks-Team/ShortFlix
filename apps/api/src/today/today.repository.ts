import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Wraps Prisma queries for Issue + Pick.
 * N+1 prevention: every read uses `include: { picks: true }` so the 9-card array
 * is fetched in a single query (per SPEC.md §12 performance budgets).
 */
@Injectable()
export class TodayRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent(locale: string) {
    return this.prisma.issue.findFirst({
      where: { locale },
      orderBy: { issueDate: "desc" },
      include: { picks: { orderBy: { position: "asc" } } },
    });
  }

  async findByDate(issueDate: Date, locale: string) {
    return this.prisma.issue.findUnique({
      where: { issueDate_locale: { issueDate, locale } },
      include: { picks: { orderBy: { position: "asc" } } },
    });
  }

  async findPage(args: { locale: string; cursor?: string; limit: number }) {
    return this.prisma.issue.findMany({
      where: { locale: args.locale },
      orderBy: { issueDate: "desc" },
      take: args.limit,
      ...(args.cursor && { cursor: { id: args.cursor }, skip: 1 }),
      include: { picks: { orderBy: { position: "asc" } } },
    });
  }
}
