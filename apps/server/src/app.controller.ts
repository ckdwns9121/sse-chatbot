import { Controller, Get, Version } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("api/v1")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Version("1")
  getHello(): { message: string; version: string; timestamp: string } {
    return this.appService.getHelloWithVersion("v1");
  }

  @Get("health")
  @Version("1")
  getHealth(): { status: string; timestamp: string; version: string } {
    return {
      ...this.appService.getHealth(),
      version: "v1",
    };
  }

  @Get("health/detailed")
  @Version("1")
  async getDetailedHealth() {
    return await this.appService.getDetailedHealth();
  }
}
