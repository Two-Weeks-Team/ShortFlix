import { Module } from "@nestjs/common";
import { TodayController } from "./today.controller";
import { TodayRepository } from "./today.repository";
import { TodayService } from "./today.service";

@Module({
  controllers: [TodayController],
  providers: [TodayService, TodayRepository],
})
export class TodayModule {}
