import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World! SSE Chatbot Server is running!";
  }

  getHelloWithVersion(version: string): { message: string; version: string; timestamp: string } {
    return {
      message: "Hello World! SSE Chatbot Server is running!",
      version: version,
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  }

  async getDetailedHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      free: number;
      percentage: number;
    };
    environment: string;
    version: string;
    checks: {
      database: { status: string; responseTime: number };
      redis?: { status: string; responseTime: number };
      externalApi?: { status: string; responseTime: number };
    };
  }> {
    const startTime = Date.now();

    // 메모리 사용량 체크
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const freeMem = totalMem - usedMem;
    const memPercentage = Math.round((usedMem / totalMem) * 100);

    // 데이터베이스 연결 체크 (시뮬레이션)
    const dbCheck = await this.checkDatabaseConnection();

    // Redis 연결 체크 (시뮬레이션)
    const redisCheck = await this.checkRedisConnection();

    // 외부 API 체크 (시뮬레이션)
    const externalApiCheck = await this.checkExternalApi();

    return {
      status: this.determineOverallStatus([dbCheck, redisCheck, externalApiCheck]),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(usedMem / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        percentage: memPercentage,
      },
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
      checks: {
        database: dbCheck,
        redis: redisCheck,
        externalApi: externalApiCheck,
      },
    };
  }

  private async checkDatabaseConnection(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();

    try {
      // 실제로는 데이터베이스 연결 테스트
      // 예: await this.databaseService.query('SELECT 1');
      await new Promise((resolve) => setTimeout(resolve, 10)); // 시뮬레이션

      return {
        status: "healthy",
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkRedisConnection(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();

    try {
      // 실제로는 Redis 연결 테스트
      // 예: await this.redisService.ping();
      await new Promise((resolve) => setTimeout(resolve, 5)); // 시뮬레이션

      return {
        status: "healthy",
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkExternalApi(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();

    try {
      // 실제로는 외부 API 호출 테스트
      // 예: await this.httpService.get('https://api.example.com/health');
      await new Promise((resolve) => setTimeout(resolve, 15)); // 시뮬레이션

      return {
        status: "healthy",
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private determineOverallStatus(checks: Array<{ status: string }>): string {
    const hasUnhealthy = checks.some((check) => check.status === "unhealthy");
    return hasUnhealthy ? "degraded" : "healthy";
  }
}
