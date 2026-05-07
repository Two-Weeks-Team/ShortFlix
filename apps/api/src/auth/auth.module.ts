import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { GoogleOAuthService } from "./google-oauth.service";
import { IdempotencyService } from "./idempotency.service";
import { JwtService } from "./jwt.service";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    JwtService,
    AuthGuard,
    GoogleOAuthService,
    IdempotencyService,
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [JwtService, GoogleOAuthService, IdempotencyService, AuthService],
})
export class AuthModule {}
