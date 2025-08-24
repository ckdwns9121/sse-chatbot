import "dotenv/config"; // 환경변수 로드
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Server is running on: http://localhost:${port}`);
}
bootstrap();
