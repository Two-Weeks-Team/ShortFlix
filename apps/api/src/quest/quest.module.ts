import { Module } from "@nestjs/common";
import { QuestController } from "./quest.controller";
import { QuestRepository } from "./quest.repository";
import { QuestService } from "./quest.service";

@Module({
  controllers: [QuestController],
  providers: [QuestService, QuestRepository],
})
export class QuestModule {}
