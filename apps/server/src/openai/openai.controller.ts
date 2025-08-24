import { Controller, Post, Body, Get, HttpException, HttpStatus, Logger, UseGuards, Res } from "@nestjs/common";
import { Response } from "express";
import { OpenAIService } from "./openai.service";
import { ChatRequest, ChatResponse, StreamingChunk } from "@sse-chatbot/shared";
import { OpenAIAuthGuard } from "../common";

@Controller("api/v1/openai")
export class OpenAIController {
  private readonly logger = new Logger(OpenAIController.name);

  constructor(private readonly openaiService: OpenAIService) {}

  @Get("test")
  test() {
    return "hello openai service";
  }

  /**
   * 일반 채팅 응답 생성
   */
  @Post("chat")
  @UseGuards(OpenAIAuthGuard)
  async chat(@Body() request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.log(`Chat request received: ${request.messages.length} messages`);

      return await this.openaiService.generateChatResponse(request);
    } catch (error) {
      this.logger.error("Chat error:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(`채팅 처리 중 오류가 발생했습니다: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 스트리밍 채팅 응답 생성
   */
  @Post("chat/stream")
  @UseGuards(OpenAIAuthGuard)
  async streamChat(@Body() request: ChatRequest, @Res() res: Response) {
    try {
      this.logger.log(`Streaming chat request received: ${request.messages.length} messages`);

      // CORS 헤더 설정
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      // 스트리밍 응답 생성
      const stream = this.openaiService.generateStreamingResponse(request);

      // 스트리밍 응답 전송
      for await (const chunk of stream) {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        res.write(data);

        // 에러가 발생하면 스트림 종료
        if (chunk.type === "error") {
          res.end();
          return;
        }

        // 완료되면 스트림 종료
        if (chunk.type === "done") {
          res.end();
          return;
        }
      }

      res.end();
    } catch (error) {
      this.logger.error("Stream chat error:", error);

      const errorChunk: StreamingChunk = {
        type: "error",
        error: `스트리밍 처리 중 오류가 발생했습니다: ${error.message}`,
      };

      const data = `data: ${JSON.stringify(errorChunk)}\n\n`;
      res.write(data);
      res.end();
    }
  }

  /**
   * 사용 가능한 모델 목록 조회
   */
  @Get("models")
  @UseGuards(OpenAIAuthGuard)
  async listModels() {
    try {
      this.logger.log("Models list request received");

      const models = await this.openaiService.listModels();
      return {
        success: true,
        data: models,
        message: "모델 목록을 성공적으로 조회했습니다.",
      };
    } catch (error) {
      this.logger.error("Models list error:", error);
      throw new HttpException(
        `모델 목록 조회 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * API 키 상태 확인
   */
  @Get("status")
  async checkStatus() {
    try {
      this.logger.log("Status check request received");

      const isValidKey = await this.openaiService.validateApiKey();

      return {
        success: true,
        data: {
          apiKeyValid: isValidKey,
          timestamp: new Date().toISOString(),
        },
        message: isValidKey ? "OpenAI API 키가 유효합니다." : "OpenAI API 키가 유효하지 않습니다.",
      };
    } catch (error) {
      this.logger.error("Status check error:", error);
      throw new HttpException(`상태 확인 중 오류가 발생했습니다: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
