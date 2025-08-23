import { Controller, Get, Version } from "@nestjs/common";
import { AppService } from "./app.service";

// v2 API 컨트롤러 - 향상된 API 버전 (더 많은 정보 제공)
@Controller("api/v2")
export class AppV2Controller {
  constructor(private readonly appService: AppService) {}

  // 루트 경로 (/) - v2 스타일의 인사말 반환 (타임스탬프 포함)
  @Get()
  @Version("2") // API 버전 명시
  getHello(): { message: string; version: string; timestamp: string } {
    return {
      message: this.appService.getHello(), // 기본 인사말 메시지
      version: "v2", // v2 버전 정보
      timestamp: new Date().toISOString(), // 현재 시간 (ISO 8601 형식)
    };
  }

  // 헬스체크 엔드포인트 (/health) - v2 스타일의 상태 정보 반환
  @Get("health")
  @Version("2") // API 버전 명시
  getHealth(): {
    status: string; // 서비스 상태
    timestamp: string; // 현재 시간
    version: string; // API 버전
    uptime: number; // 서버 가동 시간
    environment: string; // 실행 환경
  } {
    return {
      status: "healthy", // 서비스 상태 (healthy, unhealthy, degraded)
      timestamp: new Date().toISOString(), // 현재 시간
      version: "v2", // v2 버전 정보
      uptime: process.uptime(), // Node.js 프로세스 가동 시간 (초)
      environment: process.env.NODE_ENV || "development", // 환경변수에서 환경 정보 가져오기
    };
  }

  // 상세 헬스체크 엔드포인트 (/health/detailed) - v2 전용 추가 정보 포함
  @Get("health/detailed")
  @Version("2") // API 버전 명시
  async getDetailedHealth() {
    const health = await this.appService.getDetailedHealth(); // 기본 상세 헬스체크 실행
    return {
      ...health, // 기본 헬스체크 정보 확장
      version: "v2", // v2 버전 정보로 덮어쓰기
      additionalInfo: {
        serverTime: new Date().toISOString(), // 서버 시간 (v2 전용)
        nodeVersion: process.version, // Node.js 버전 정보 (v2 전용)
        platform: process.platform, // 운영체제 플랫폼 정보 (v2 전용)
      },
    };
  }
}
