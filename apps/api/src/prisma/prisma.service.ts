import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client wrapper with explicit lifecycle hooks.
 *
 * Note: DATABASE_URL is read by Prisma directly from the environment. The .env loader
 * (apps/api/.env or repo root .env) is responsible for materializing the absolute SQLite
 * path under ~/.preview-forge/shortflix/dev.db (Prisma does NOT expand `~`).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: "warn", emit: "event" },
        { level: "error", emit: "event" },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log("Prisma connected");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
