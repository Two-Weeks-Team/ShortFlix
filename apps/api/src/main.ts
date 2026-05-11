import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger, type INestApplication } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // CORS — web (Next.js PWA) calls /api/* cross-origin. CORS_ORIGINS env can
  // override with a comma-separated allowlist; defaults cover the deployed
  // shortflix-web Cloud Run URL + local dev. Credentials enabled for cookie auth.
  const corsOrigins = (
    process.env.CORS_ORIGINS ??
    "https://shortflix-web-882201353419.asia-northeast3.run.app,http://localhost:3000,http://localhost:3001"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-CSRF-Token"],
  });

  app.use(helmet({ contentSecurityPolicy: false })); // SecurityHeadersMiddleware sets CSP.
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT ?? 8081);
  await app.listen(port);
  new Logger("bootstrap").log(`ShortFlix API listening on :${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("bootstrap failed", err);
  process.exit(1);
});
