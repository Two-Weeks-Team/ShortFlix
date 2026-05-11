import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { A2AModule } from "./a2a/a2a.module";
import { AblationModule } from "./ablation/ablation.module";
import { AuthModule } from "./auth/auth.module";
import { CsrfMiddleware } from "./common/middleware/csrf.middleware";
import { RateLimitMiddleware } from "./common/middleware/rate-limit.middleware";
import { SecurityHeadersMiddleware } from "./common/middleware/security-headers.middleware";
import { ConfigModule } from "./config/config.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QuestModule } from "./quest/quest.module";
import { SearchModule } from "./search/search.module";
import { TodayModule } from "./today/today.module";

@Module({
  imports: [
    ConfigModule, // @Global — provides APP_CONFIG to all downstream modules
    PrismaModule,
    AuthModule,
    A2AModule,
    TodayModule,
    SearchModule,
    QuestModule,
    AblationModule,
    EventsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SecurityHeadersMiddleware).forRoutes("*");
    consumer.apply(CsrfMiddleware).forRoutes("*");
    consumer.apply(RateLimitMiddleware).forRoutes("*");
  }
}
