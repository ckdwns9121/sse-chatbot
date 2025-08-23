import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class VersionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const pathParts = req.path.split("/");

    // /api/v1/... 또는 /api/v2/... 형태에서 버전 추출
    let version = "unknown";
    if (pathParts.length >= 3 && pathParts[1] === "api") {
      version = pathParts[2];
    }

    // 버전별 헤더 추가
    res.setHeader("X-API-Version", version);

    // 버전별 로깅
    console.log(`[${version}] ${req.method} ${req.path}`);

    next();
  }
}
