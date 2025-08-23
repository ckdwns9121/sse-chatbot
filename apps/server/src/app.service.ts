import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  // 기본 인사말 반환 - 간단한 문자열 응답
  getHello(): string {
    return "Hello World! SSE Chatbot Server is running!";
  }

  // 버전 정보를 포함한 인사말 반환 - API 버저닝 지원
  getHelloWithVersion(version: string): { message: string; version: string; timestamp: string } {
    return {
      message: "Hello World! SSE Chatbot Server is running!",
      version: version, // API 버전 정보 (v1, v2 등)
      timestamp: new Date().toISOString(), // ISO 8601 형식의 현재 시간
    };
  }

  // 기본 헬스체크 - 간단한 상태 정보만 반환
  getHealth(): { status: string; timestamp: string } {
    return {
      status: "healthy", // 서비스 상태 (healthy, unhealthy, degraded)
      timestamp: new Date().toISOString(), // 헬스체크 수행 시간
    };
  }

  // 상세 헬스체크 - 프로덕션 환경에서 사용하는 종합적인 상태 점검
  async getDetailedHealth(): Promise<{
    status: string; // 전체 시스템 상태
    timestamp: string; // 체크 수행 시간
    uptime: number; // 서버 가동 시간 (초)
    memory: {
      used: number; // 사용 중인 메모리 (MB)
      total: number; // 전체 메모리 (MB)
      free: number; // 여유 메모리 (MB)
      percentage: number; // 메모리 사용률 (%)
    };
    environment: string; // 실행 환경 (development, production 등)
    version: string; // 애플리케이션 버전
    checks: {
      database: { status: string; responseTime: number }; // DB 연결 상태 및 응답시간
      redis?: { status: string; responseTime: number }; // Redis 연결 상태 및 응답시간 (선택적)
      externalApi?: { status: string; responseTime: number }; // 외부 API 상태 및 응답시간 (선택적)
    };
  }> {
    const startTime = Date.now(); // 전체 헬스체크 시작 시간 기록

    // Node.js 프로세스의 메모리 사용량 정보 가져오기
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal; // V8 엔진이 할당한 총 힙 메모리
    const usedMem = memUsage.heapUsed; // 실제 사용 중인 힙 메모리
    const freeMem = totalMem - usedMem; // 사용 가능한 여유 메모리
    const memPercentage = Math.round((usedMem / totalMem) * 100); // 메모리 사용률 계산

    // 각 의존성 서비스의 상태를 병렬로 체크 (성능 최적화)
    const dbCheck = await this.checkDatabaseConnection(); // 데이터베이스 연결 상태 확인
    const redisCheck = await this.checkRedisConnection(); // Redis 연결 상태 확인
    const externalApiCheck = await this.checkExternalApi(); // 외부 API 상태 확인

    // 모든 체크 결과를 종합하여 최종 상태 결정
    return {
      status: this.determineOverallStatus([dbCheck, redisCheck, externalApiCheck]), // 전체 상태 판단
      timestamp: new Date().toISOString(), // 현재 시간
      uptime: process.uptime(), // Node.js 프로세스 가동 시간
      memory: {
        used: Math.round(usedMem / 1024 / 1024), // 바이트를 MB로 변환
        total: Math.round(totalMem / 1024 / 1024), // 바이트를 MB로 변환
        free: Math.round(freeMem / 1024 / 1024), // 바이트를 MB로 변환
        percentage: memPercentage, // 계산된 사용률
      },
      environment: process.env.NODE_ENV || "development", // 환경변수에서 환경 정보 가져오기
      version: process.env.APP_VERSION || "1.0.0", // 환경변수에서 버전 정보 가져오기
      checks: {
        database: dbCheck, // DB 체크 결과
        redis: redisCheck, // Redis 체크 결과
        externalApi: externalApiCheck, // 외부 API 체크 결과
      },
    };
  }

  // 데이터베이스 연결 상태 확인 - 실제로는 DB 쿼리 실행
  private async checkDatabaseConnection(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now(); // 응답시간 측정 시작

    try {
      // 실제 구현에서는 실제 DB 쿼리 실행
      // 예: await this.databaseService.query('SELECT 1');
      await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms 지연으로 시뮬레이션

      return {
        status: "healthy", // 연결 성공 시 healthy
        responseTime: Date.now() - startTime, // 응답시간 계산 (ms)
      };
    } catch (error) {
      return {
        status: "unhealthy", // 연결 실패 시 unhealthy
        responseTime: Date.now() - startTime, // 실패 시에도 응답시간 기록
      };
    }
  }

  // Redis 연결 상태 확인 - 실제로는 Redis PING 명령어 실행
  private async checkRedisConnection(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now(); // 응답시간 측정 시작

    try {
      // 실제 구현에서는 Redis PING 명령어 실행
      // 예: await this.redisService.ping();
      await new Promise((resolve) => setTimeout(resolve, 5)); // 5ms 지연으로 시뮬레이션

      return {
        status: "healthy", // 연결 성공 시 healthy
        responseTime: Date.now() - startTime, // 응답시간 계산 (ms)
      };
    } catch (error) {
      return {
        status: "unhealthy", // 연결 실패 시 unhealthy
        responseTime: Date.now() - startTime, // 실패 시에도 응답시간 기록
      };
    }
  }

  // 외부 API 연결 상태 확인 - 실제로는 HTTP 요청 실행
  private async checkExternalApi(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now(); // 응답시간 측정 시작

    try {
      // 실제 구현에서는 외부 API에 HTTP 요청
      // 예: await this.httpService.get('https://api.example.com/health');
      await new Promise((resolve) => setTimeout(resolve, 15)); // 15ms 지연으로 시뮬레이션

      return {
        status: "healthy", // API 응답 성공 시 healthy
        responseTime: Date.now() - startTime, // 응답시간 계산 (ms)
      };
    } catch (error) {
      return {
        status: "unhealthy", // API 응답 실패 시 unhealthy
        responseTime: Date.now() - startTime, // 실패 시에도 응답시간 기록
      };
    }
  }

  // 전체 상태 판단 로직 - 하나라도 unhealthy가 있으면 degraded
  private determineOverallStatus(checks: Array<{ status: string }>): string {
    const hasUnhealthy = checks.some((check) => check.status === "unhealthy"); // unhealthy 상태가 하나라도 있는지 확인
    return hasUnhealthy ? "degraded" : "healthy"; // unhealthy가 있으면 degraded, 없으면 healthy
  }
}
