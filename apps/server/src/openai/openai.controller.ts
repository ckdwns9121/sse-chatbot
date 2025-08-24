import { Controller, Post, Body, Sse, Get, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { OpenAIService } from "./openai.service";
import { ChatRequest, ChatResponse, StreamingChunk } from "@sse-chatbot/shared";

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
  async chat(@Body() request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.log(`Chat request received: ${request.messages.length} messages`);

      // API 키 유효성 검증
      const isValidKey = await this.openaiService.validateApiKey();
      if (!isValidKey) {
        throw new HttpException("OpenAI API 키가 유효하지 않습니다.", HttpStatus.UNAUTHORIZED);
      }

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
  @Sse("chat/stream")
  async streamChat(@Body() request: ChatRequest) {
    try {
      this.logger.log(`Streaming chat request received: ${request.messages.length} messages`);

      // API 키 유효성 검증
      const isValidKey = await this.openaiService.validateApiKey();
      if (!isValidKey) {
        throw new Error("OpenAI API 키가 유효하지 않습니다.");
      }

      // 스트리밍 응답 생성
      const stream = this.openaiService.generateStreamingResponse(request);

      return new ReadableStream({
        start: async (controller) => {
          try {
            for await (const chunk of stream) {
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));

              // 에러가 발생하면 스트림 종료
              if (chunk.type === "error") {
                controller.close();
                break;
              }

              // 완료되면 스트림 종료
              if (chunk.type === "done") {
                controller.close();
                break;
              }
            }
          } catch (error) {
            this.logger.error("Streaming error:", error);
            const errorChunk: StreamingChunk = {
              type: "error",
              error: `스트리밍 처리 중 오류가 발생했습니다: ${error.message}`,
            };
            const data = `data: ${JSON.stringify(errorChunk)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
            controller.close();
          }
        },
      });
    } catch (error) {
      this.logger.error("Stream chat error:", error);
      throw new HttpException(
        `스트리밍 채팅 처리 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 사용 가능한 모델 목록 조회
   */
  @Get("models")
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
