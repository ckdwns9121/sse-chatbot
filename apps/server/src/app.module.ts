import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { AppV2Controller } from "./app-v2.controller";
import { VersionMiddleware } from "./middleware/version.middleware";
import { OpenAIModule } from "./openai/openai.module";

// 메인 애플리케이션 모듈 - 모든 컨트롤러와 서비스를 통합 관리
@Module({
  imports: [OpenAIModule], // OpenAI 모듈 추가
  controllers: [AppController, AppV2Controller], // v1, v2 API 컨트롤러 등록
  providers: [AppService], // 공통 서비스 등록 (v1, v2에서 공유)
})
export class AppModule implements NestModule {
  // NestModule 인터페이스 구현 - 미들웨어 설정
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VersionMiddleware) // VersionMiddleware 적용
      .forRoutes("*"); // 모든 라우트에 미들웨어 적용
  }
}
