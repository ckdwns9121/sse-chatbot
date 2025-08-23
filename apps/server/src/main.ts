import "dotenv/config"; // 환경변수 로드
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
}
bootstrap();
