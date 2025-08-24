import { Controller, Get, Version } from "@nestjs/common";
import { AppService } from "./app.service";

// v1 API 컨트롤러 - 기본 API 버전
@Controller("api/v1")
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 루트 경로 (/) - 기본 인사말 반환
  @Get()
  @Version("1") // API 버전 명시
  getHello(): { message: string; version: string; timestamp: string } {
    return this.appService.getHelloWithVersion("v1"); // v1 버전 정보와 함께 인사말 반환
  }

  // 헬스체크 엔드포인트 (/health) - 기본 상태 정보 반환
  @Get("health")
  @Version("1") // API 버전 명시
  getHealth(): { status: string; timestamp: string; version: string } {
    return {
      ...this.appService.getHealth(), // 기본 헬스체크 정보 가져오기
      version: "v1", // v1 버전 정보 추가
    };
  }

  // 상세 헬스체크 엔드포인트 (/health/detailed) - 종합적인 시스템 상태 반환
  @Get("health/detailed")
  @Version("1") // API 버전 명시
  async getDetailedHealth() {
    return await this.appService.getDetailedHealth(); // 상세 헬스체크 실행
  }
}
