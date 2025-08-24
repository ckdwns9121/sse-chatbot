import "dotenv/config"; // 환경변수 로드
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // CORS 설정 추가
  app.enableCors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Vite 기본 포트와 추가 포트
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Server is running on: http://localhost:${port}`);
}
bootstrap();
