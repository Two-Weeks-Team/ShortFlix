import type { INestiaConfig } from "@nestia/sdk";

/**
 * Nestia config. Drives:
 *   - `pnpm build:sdk`     — emits a typed fetcher SDK (consumed by apps/web FE).
 *   - `pnpm build:swagger` — emits apps/api/specs/swagger.json (CI compares to openapi.yaml).
 */
const config: INestiaConfig = {
  input: ["src/**/*.controller.ts"],
  output: "src/api",
  swagger: {
    output: "specs/swagger.json",
    servers: [
      { url: "https://api.shortflix.run.app", description: "Cloud Run development server" },
      { url: "http://localhost:8081", description: "Local dev (test harness on .env.test, port 8081)" },
    ],
    info: {
      title: "ShortFlix API",
      version: "0.1.1",
    },
    beautify: true,
  },
  primitive: false,
  simulate: false,
};

export default config;
