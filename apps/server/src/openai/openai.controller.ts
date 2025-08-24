import { Controller, Post, Body, Get, HttpException, HttpStatus, Logger, UseGuards, Res, Query } from "@nestjs/common";
import { Response } from "express";
import { OpenAIService } from "./openai.service";
import { ChatRequest, ChatResponse, StreamingChunk } from "@sse-chatbot/shared";
import { OpenAIAuthGuard } from "../common";

@Controller("api/v1/openai")
export class OpenAIController {
  private readonly logger = new Logger(OpenAIController.name);
  private readonly sseConnections = new Map<string, Response>();

  constructor(private readonly openaiService: OpenAIService) {}

  @Get("test")
  test() {
    return "hello openai service";
  }

  /**
   * SSE 연결 수립 (응답 수신 전용)
   */
  @Get("chat/stream")
  @UseGuards(OpenAIAuthGuard)
  async establishSSEConnection(@Query("sessionId") sessionId: string, @Res() res: Response) {
    try {
      // sessionId 유효성 검사
      if (!sessionId || sessionId.trim() === "") {
        this.logger.warn("SSE connection request with no sessionId");
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "sessionId is required",
        });
        return;
      }

      this.logger.log(`SSE connection established for session: ${sessionId}`);

      // SSE 표준 헤더 설정
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "http://localhost:3000");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("X-Accel-Buffering", "no"); // Nginx 버퍼링 비활성화

      // 연결 유지를 위한 heartbeat 전송
      const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n");
      }, 30000); // 30초마다 heartbeat

      // SSE 연결을 Map에 저장
      this.sseConnections.set(sessionId, res);

      // 연결이 끊어질 때 정리
      res.on("close", () => {
        this.logger.log(`SSE connection closed for session: ${sessionId}`);
        clearInterval(heartbeat);
        this.sseConnections.delete(sessionId);
      });

      // 연결 유지 (클라이언트가 연결을 끊을 때까지)
      res.on("error", (error) => {
        this.logger.error(`SSE connection error for session ${sessionId}:`, error);
        clearInterval(heartbeat);
        this.sseConnections.delete(sessionId);
      });
    } catch (error) {
      this.logger.error("SSE connection error:", error);
      res.end();
    }
  }

  /**
   * 메시지 전송 및 스트리밍 응답 생성 (POST 요청)
   */
  @Post("chat/stream")
  @UseGuards(OpenAIAuthGuard)
  async streamChat(@Body() request: ChatRequest) {
    try {
      this.logger.log(`Stream chat request received for session: ${request.sessionId}`);

      // 해당 세션의 SSE 연결 확인
      const sseConnection = this.sseConnections.get(request.sessionId);
      if (!sseConnection) {
        throw new HttpException(`SSE connection not found for session: ${request.sessionId}`, HttpStatus.BAD_REQUEST);
      }

      // 스트리밍 응답 생성 및 SSE 연결로 푸시
      const stream = this.openaiService.generateStreamingResponse(request);

      for await (const chunk of stream) {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        sseConnection.write(data);

        // 에러가 발생하면 스트림 종료
        if (chunk.type === "error") {
          break;
        }

        // 완료되면 스트림 종료
        if (chunk.type === "done") {
          break;
        }
      }

      return { success: true, message: "스트리밍 응답이 전송되었습니다." };
    } catch (error) {
      this.logger.error("Stream chat error:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `스트리밍 처리 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
