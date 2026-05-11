import { Global, Module } from "@nestjs/common";
import { loadConfig } from "./configuration";

// Global ConfigModule so any module (Auth/A2A/Health/etc) can inject APP_CONFIG
// without explicitly importing this module.
@Global()
@Module({
  providers: [
    {
      provide: "APP_CONFIG",
      useFactory: () => loadConfig(),
    },
  ],
  exports: ["APP_CONFIG"],
})
export class ConfigModule {}
