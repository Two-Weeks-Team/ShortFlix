import { TypedParam, TypedRoute } from "@nestia/core";
import { Controller, Inject } from "@nestjs/common";
import { request } from "undici";
import { Public } from "../auth/auth.guard";
import { ProblemException } from "../common/problem";
import type { AppConfig } from "../config/configuration";
import type { Health, ServiceName } from "../dtos/common.dto";

const STARTED = Date.now();

@Controller("api/health")
export class HealthController {
  constructor(@Inject("APP_CONFIG") private readonly cfg: AppConfig) {}

  /** GET /api/health — orchestrator (gateway) liveness. */
  @Public()
  @TypedRoute.Get()
  getHealth(): Health {
    return {
      service: "orchestrator",
      status: "ok",
      version: process.env.npm_package_version ?? "0.1.1",
      commitSha: process.env.GIT_COMMIT_SHA ?? undefined,
      uptimeSec: Math.floor((Date.now() - STARTED) / 1000),
    };
  }

  /** GET /api/health/{service} — proxied liveness for one of the seven services. */
  @Public()
  @TypedRoute.Get(":service")
  async getServiceHealth(@TypedParam("service") service: ServiceName): Promise<Health> {
    if (service === "orchestrator") return this.getHealth();
    const baseUrl = this.urlFor(service);
    try {
      const { statusCode, body } = await request(`${baseUrl}/api/health`, {
        method: "GET",
        headersTimeout: 2_000,
        bodyTimeout: 3_000,
      });
      const text = await body.text();
      if (statusCode >= 500) {
        throw new ProblemException("service-unavailable", { detail: `${service} → ${statusCode}` });
      }
      return JSON.parse(text) as Health;
    } catch (err) {
      if (err instanceof ProblemException) throw err;
      throw new ProblemException("service-unavailable", {
        detail: `${service}: ${(err as Error).message}`,
      });
    }
  }

  private urlFor(service: ServiceName): string {
    switch (service) {
      case "curator":
        return this.cfg.agents.curatorBaseUrl;
      case "unified-search":
        return this.cfg.agents.unifiedSearchBaseUrl;
      case "trend-safety":
        return this.cfg.agents.trendSafetyBaseUrl;
      case "yt-shorts-mcp":
        return this.cfg.mcp.ytShortsBaseUrl;
      case "ig-reels-mcp":
        return this.cfg.mcp.igReelsBaseUrl;
      case "tiktok-mcp":
        return this.cfg.mcp.tiktokBaseUrl;
      case "orchestrator":
        return this.cfg.agents.orchestratorBaseUrl;
    }
  }
}
