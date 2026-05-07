import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { ProblemException } from "../common/problem";

const TTL_HOURS = 24;

/**
 * Idempotency-Key contract per SPEC.md §10.
 *
 * Replay flow:
 *   - hit + same requestHash → return stored response (caller treats as cache hit).
 *   - hit + different requestHash → 409 idempotency-conflict.
 *   - miss → caller proceeds; calls `record` once side effects committed.
 */
@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  computeHash(method: string, path: string, body: unknown): string {
    const canonical = JSON.stringify(body ?? {}, Object.keys(body ?? {}).sort());
    return createHash("sha256").update(`${method}\n${path}\n${canonical}`).digest("hex");
  }

  async lookup(
    key: string,
    userId: string,
    requestHash: string,
  ): Promise<{ replay: true; status: number; body: unknown } | { replay: false }> {
    const row = await this.prisma.idempotencyRecord.findUnique({ where: { key } });
    if (!row) return { replay: false };
    if (row.userId !== userId) {
      throw new ProblemException("idempotency-conflict", {
        detail: "Idempotency-Key reused across user accounts",
      });
    }
    if (row.expiresAt.getTime() < Date.now()) {
      // Expired — caller may proceed; we leave the record for the cleanup job.
      return { replay: false };
    }
    if (row.requestHash !== requestHash) {
      throw new ProblemException("idempotency-conflict", {
        detail: "Same Idempotency-Key with different payload",
      });
    }
    return {
      replay: true,
      status: row.responseCode,
      body: JSON.parse(row.responseBody),
    };
  }

  async record(args: {
    key: string;
    userId: string;
    method: string;
    path: string;
    requestHash: string;
    responseCode: number;
    responseBody: unknown;
  }): Promise<void> {
    const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);
    await this.prisma.idempotencyRecord.upsert({
      where: { key: args.key },
      create: {
        key: args.key,
        userId: args.userId,
        method: args.method,
        path: args.path,
        requestHash: args.requestHash,
        responseCode: args.responseCode,
        responseBody: JSON.stringify(args.responseBody ?? null),
        expiresAt,
      },
      update: {
        responseCode: args.responseCode,
        responseBody: JSON.stringify(args.responseBody ?? null),
        expiresAt,
      },
    });
  }
}
