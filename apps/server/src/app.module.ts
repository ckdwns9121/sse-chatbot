import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { AppV2Controller } from "./app-v2.controller";
import { VersionMiddleware } from "./middleware/version.middleware";

@Module({
  imports: [],
  controllers: [AppController, AppV2Controller],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VersionMiddleware).forRoutes("*");
  }
}
