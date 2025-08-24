import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { ChatMessage, ChatRequest, ChatResponse, StreamingChunk } from "@sse-chatbot/shared";

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;

  constructor() {
    // OpenAI 클라이언트 초기화
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false, // 서버 사이드에서만 사용
    });
  }

  /**
   * 일반 채팅 응답 생성
   */
  async generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.log(`Generating chat response for ${request.messages.length} messages`);

      // OpenAI API 호출
      const completion = await this.openai.chat.completions.create({
        model: request.modelConfig?.model || "gpt-3.5-turbo",
        messages: request.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: request.modelConfig?.temperature || 0.7,
        max_tokens: request.modelConfig?.maxTokens || 1000,
        top_p: request.modelConfig?.topP || 1,
        frequency_penalty: request.modelConfig?.frequencyPenalty || 0,
        presence_penalty: request.modelConfig?.presencePenalty || 0,
      });

      const assistantMessage = completion.choices[0]?.message;
      if (!assistantMessage) {
        throw new Error("No response from OpenAI");
      }

      // 응답 메시지 생성
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: assistantMessage.content || "",
        timestamp: new Date(),
        metadata: {
          model: completion.model,
          usage: completion.usage,
        },
      };

      return {
        message: responseMessage,
        sessionId: request.sessionId,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error("OpenAI API error:", error);
      throw new Error(`OpenAI API 호출 실패: ${error.message}`);
    }
  }

  /**
   * 스트리밍 채팅 응답 생성
   */
  async *generateStreamingResponse(request: ChatRequest): AsyncGenerator<StreamingChunk> {
    try {
      this.logger.log(`Generating streaming response for ${request.messages.length} messages`);

      // OpenAI 스트리밍 API 호출
      const stream = await this.openai.chat.completions.create({
        model: request.modelConfig?.model || "gpt-3.5-turbo",
        messages: request.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: request.modelConfig?.temperature || 0.7,
        max_tokens: request.modelConfig?.maxTokens || 1000,
        top_p: request.modelConfig?.topP || 1,
        frequency_penalty: request.modelConfig?.frequencyPenalty || 0,
        presence_penalty: request.modelConfig?.presencePenalty || 0,
        stream: true,
      });

      // 스트리밍 응답 처리
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;

        if (content) {
          yield {
            type: "text",
            content,
            metadata: {
              model: chunk.model,
              finishReason: chunk.choices[0]?.finish_reason,
            },
          };
        }
      }

      // 스트리밍 완료 신호
      yield { type: "done" };
    } catch (error) {
      this.logger.error("OpenAI streaming error:", error);
      yield {
        type: "error",
        error: `OpenAI 스트리밍 API 호출 실패: ${error.message}`,
      };
    }
  }

  /**
   * 모델 목록 조회
   */
  async listModels() {
    try {
      const models = await this.openai.models.list();
      return models.data.map((model) => ({
        id: model.id,
        name: model.id,
        created: model.created,
        ownedBy: model.owned_by,
      }));
    } catch (error) {
      this.logger.error("Failed to list models:", error);
      throw new Error("모델 목록 조회 실패");
    }
  }

  /**
   * API 키 유효성 검증
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      this.logger.error("API key validation failed:", error);
      return false;
    }
  }
}
