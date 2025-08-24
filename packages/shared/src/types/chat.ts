// 채팅 메시지 역할 타입
export type ChatRole = "user" | "assistant" | "system";

// 채팅 메시지 인터페이스
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 채팅 세션 인터페이스
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// 스트리밍 응답 청크 타입
export interface StreamingChunk {
  type: "text" | "error" | "done";
  content?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// AI 모델 설정 타입
export interface AIModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// 채팅 요청 타입
export interface ChatRequest {
  messages: ChatMessage[];
  modelConfig?: AIModelConfig;
  stream?: boolean;
  sessionId?: string;
}

// 채팅 응답 타입
export interface ChatResponse {
  message: ChatMessage;
  sessionId?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
