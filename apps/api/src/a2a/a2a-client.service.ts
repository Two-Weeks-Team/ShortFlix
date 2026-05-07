import { Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { request } from "undici";
import type { AppConfig } from "../config/configuration";
import { ProblemException } from "../common/problem";
import type {
  A2ADispatchRequest,
  A2AResponse,
  A2ATargetAgent,
} from "../dtos/a2a.dto";

/**
 * HTTP client to the four ADK agent services (Python, OUT OF SCOPE for this team).
 *
 * Local dev assumes:
 *   - orchestrator     :8081  (this gateway runs in-process; the orchestrator agent is
 *                              a separate Python service that this gateway also calls
 *                              for the nightly batch trigger and ablation precompute)
 *   - curator          :8082
 *   - unified-search   :8083
 *   - trend-safety     :8084
 *
 * In Cloud Run prod, each agent is a SEPARATE Cloud Run service (MD-02 binding rider).
 *
 * The gateway forwards W3C `traceparent` so the seven-service trace tree is preserved.
 *
 * NOTE: until the Python services land, calls fail fast with a 503 problem+json. The
 * gateway exposes the precise upstream URL so judges and developers can verify trace
 * separation in `gcloud trace describe`.
 */
@Injectable()
export class A2AClientService {
  private readonly logger = new Logger(A2AClientService.name);

  constructor(@Inject("APP_CONFIG") private readonly cfg: AppConfig) {}

  /** Dispatch to the orchestrator (the agent front-door). */
  async dispatch(
    body: A2ADispatchRequest,
    options: { traceparent?: string; idempotencyKey?: string } = {},
  ): Promise<A2AResponse> {
    return this.postJson(this.cfg.agents.orchestratorBaseUrl, "/a2a/dispatch", body, options);
  }

  /** Direct dispatch to a specific agent (orchestrator → agent). Used for fan-out. */
  async dispatchTo(
    agent: A2ATargetAgent,
    rpc: string,
    payload: Record<string, unknown>,
    options: { traceparent?: string; deadlineMs?: number; idempotencyKey?: string } = {},
  ): Promise<A2AResponse> {
    const baseUrl = this.baseUrlFor(agent);
    const body: A2ADispatchRequest = {
      toAgent: agent,
      rpc,
      payload,
      ...(options.deadlineMs && { deadlineMs: options.deadlineMs }),
    };
    return this.postJson(baseUrl, "/a2a/dispatch", body, options);
  }

  private baseUrlFor(agent: A2ATargetAgent): string {
    switch (agent) {
      case "CURATOR":
        return this.cfg.agents.curatorBaseUrl;
      case "UNIFIED_SEARCH":
        return this.cfg.agents.unifiedSearchBaseUrl;
      case "TREND_SAFETY":
        return this.cfg.agents.trendSafetyBaseUrl;
    }
  }

  private async postJson(
    baseUrl: string,
    path: string,
    body: unknown,
    options: { traceparent?: string; idempotencyKey?: string },
  ): Promise<A2AResponse> {
    const url = `${baseUrl}${path}`;
    const traceparent = options.traceparent ?? this.makeTraceparent();
    const idempotencyKey = options.idempotencyKey ?? randomUUID();
    try {
      const { statusCode, body: respBody } = await request(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": idempotencyKey,
          traceparent,
          // In prod this is a Google-signed identity token (Workload Identity Federation).
          // Local dev uses an opaque shared secret.
          authorization: `Bearer ${this.cfg.serviceAccount.token}`,
        },
        body: JSON.stringify(body),
        bodyTimeout: 10_000,
        headersTimeout: 5_000,
      });
      const text = await respBody.text();
      const json = text ? (JSON.parse(text) as A2AResponse) : (null as unknown as A2AResponse);
      if (statusCode >= 500) {
        throw new ProblemException("service-unavailable", {
          detail: `Upstream ${url} returned ${statusCode}`,
          traceId: traceparent.split("-")[1],
        });
      }
      return json;
    } catch (err) {
      if (err instanceof ProblemException) throw err;
      this.logger.warn(`A2A call to ${url} failed: ${(err as Error).message}`);
      throw new ProblemException("service-unavailable", {
        detail: `A2A call failed: ${(err as Error).message}`,
        traceId: traceparent.split("-")[1],
      });
    }
  }

  private makeTraceparent(): string {
    const traceId = randomUUID().replace(/-/g, "").padEnd(32, "0").slice(0, 32);
    const spanId = randomUUID().replace(/-/g, "").slice(0, 16);
    return `00-${traceId}-${spanId}-01`;
  }
}
