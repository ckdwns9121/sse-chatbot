import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

// API 버전별 미들웨어 - 모든 요청에 버전 정보를 헤더로 추가하고 로깅
@Injectable()
export class VersionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(VersionMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // URL 경로를 '/' 기준으로 분할하여 분석
    const pathParts = req.path.split("/");

    // /api/v1/... 또는 /api/v2/... 형태에서 버전 추출
    let version = "unknown"; // 기본값 설정
    if (pathParts.length >= 3 && pathParts[1] === "api") {
      version = pathParts[2]; // 세 번째 부분이 버전 (v1, v2 등)
    }

    // 응답 헤더에 API 버전 정보 추가 (클라이언트에서 확인 가능)
    res.setHeader("X-API-Version", version);

    // 버전별 요청 로깅 (모니터링 및 디버깅용)
    this.logger.log(`[${version}] ${req.method} ${req.path}`);

    next(); // 다음 미들웨어나 컨트롤러로 요청 전달
  }
}
