import { Module } from "@nestjs/common";
import { AblationController } from "./ablation.controller";
import { AblationRepository } from "./ablation.repository";
import { AblationService } from "./ablation.service";

@Module({
  controllers: [AblationController],
  providers: [AblationService, AblationRepository],
})
export class AblationModule {}
