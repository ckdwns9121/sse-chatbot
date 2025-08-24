import "dotenv/config"; // 환경변수 로드
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import serverlessExpress from "@vendia/serverless-express";

// AWS Lambda 타입 정의
interface APIGatewayProxyEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: string | null;
  queryStringParameters: Record<string, string> | null;
  pathParameters: Record<string, string> | null;
}

interface Context {
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  getRemainingTimeInMillis(): number;
}

interface APIGatewayProxyResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

let server: (event: any, context: any) => Promise<any>;

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

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  server = server ?? (await bootstrap());
  return server(event, context);
};

// 로컬 개발용
if (process.env.NODE_ENV !== "production") {
  const app = NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  app.then(async (app) => {
    app.enableCors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    });

    const port = process.env.PORT || 3001;
    await app.listen(port, "0.0.0.0");
    logger.log(`🚀 Server is running on: http://localhost:${port}`);
  });
}
