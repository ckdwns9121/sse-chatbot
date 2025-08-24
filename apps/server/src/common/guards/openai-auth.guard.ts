import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { OpenAIService } from "../../openai/openai.service";

@Injectable()
export class OpenAIAuthGuard implements CanActivate {
  private readonly logger = new Logger(OpenAIAuthGuard.name);

  constructor(private readonly openaiService: OpenAIService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;

    this.logger.log(`Validating API key for ${method} ${path}`);

    try {
      const isValidKey = await this.openaiService.validateApiKey();

      if (!isValidKey) {
        this.logger.warn(`API key validation failed for ${method} ${path}`);
        throw new UnauthorizedException("OpenAI API 키가 유효하지 않습니다.");
      }

      this.logger.log(`API key validation successful for ${method} ${path}`);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`API key validation error for ${method} ${path}:`, error);
      throw new UnauthorizedException("API 키 검증 중 오류가 발생했습니다.");
    }
  }
}
