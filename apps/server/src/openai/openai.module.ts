import { Module } from "@nestjs/common";
import { OpenAIController } from "./openai.controller";
import { OpenAIService } from "./openai.service";
import { OpenAIAuthGuard } from "../common";

@Module({
  controllers: [OpenAIController],
  providers: [OpenAIService, OpenAIAuthGuard],
  exports: [OpenAIService], // 다른 모듈에서 사용할 수 있도록 export
})
export class OpenAIModule {}
