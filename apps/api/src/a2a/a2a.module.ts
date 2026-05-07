import { Global, Module } from "@nestjs/common";
import { A2AClientService } from "./a2a-client.service";

@Global()
@Module({
  providers: [A2AClientService],
  exports: [A2AClientService],
})
export class A2AModule {}
