import { Controller, Get, Version } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("api/v2")
export class AppV2Controller {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Version("2")
  getHello(): { message: string; version: string; timestamp: string } {
    return {
      message: this.appService.getHello(),
      version: "v2",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("health")
  @Version("2")
  getHealth(): {
    status: string;
    timestamp: string;
    version: string;
    uptime: number;
    environment: string;
  } {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "v2",
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };
  }

  @Get("health/detailed")
  @Version("2")
  async getDetailedHealth() {
    const health = await this.appService.getDetailedHealth();
    return {
      ...health,
      version: "v2",
      additionalInfo: {
        serverTime: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  }
}
