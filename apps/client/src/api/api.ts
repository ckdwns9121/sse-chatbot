import { axiosInstance } from "@/entities/api/axios-instance";
import { ChatRequest, ChatResponse, StreamingChunk } from "@sse-chatbot/shared";

// 일반 채팅 API
export const postChat = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await axiosInstance.post("/api/v1/openai/chat", request);
  return response.data;
};

// SSE 연결 수립 (응답 수신 전용)
export const establishSSEConnection = (
  sessionId: string,
  onChunk: (chunk: StreamingChunk) => void,
  onError: (error: string) => void
): (() => void) => {
  try {
    const eventSource = new EventSource(
      `${axiosInstance.defaults.baseURL}/api/v1/openai/chat/stream?sessionId=${sessionId}`,
      { withCredentials: false }
    );

    // 메시지 수신 처리
    eventSource.onmessage = (event) => {
      try {
        if (event.data.trim()) {
          const chunk: StreamingChunk = JSON.parse(event.data);
          onChunk(chunk);

          if (chunk.type === "error") {
            onError(chunk.error || "스트리밍 오류가 발생했습니다.");
          }
        }
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError);
      }
    };

    // 에러 처리
    eventSource.onerror = (event) => {
      console.error("EventSource 에러:", event);
      onError("SSE 연결 중 오류가 발생했습니다.");
    };

    // 연결 열림 처리
    eventSource.onopen = () => {
      console.log("SSE 연결이 열렸습니다.");
    };

    // 연결 종료 시 정리 함수 반환
    return () => {
      eventSource.close();
    };
  } catch (error) {
    console.error("SSE 연결 오류:", error);
    onError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    return () => {}; // 빈 cleanup 함수 반환
  }
};

// 스트리밍 채팅 메시지 전송 (POST 요청)
export const sendStreamChatMessage = async (request: ChatRequest): Promise<void> => {
  try {
    const response = await axiosInstance.post("/api/v1/openai/chat/stream", request);

    if (!response.data.success) {
      throw new Error("스트리밍 메시지 전송에 실패했습니다.");
    }
  } catch (error) {
    console.error("스트리밍 메시지 전송 오류:", error);
    throw error;
  }
};

// OpenAI 상태 확인
export const checkOpenAIStatus = async () => {
  const response = await axiosInstance.get("/api/v1/openai/status");
  return response.data;
};

// 사용 가능한 모델 목록 조회
export const getModels = async () => {
  const response = await axiosInstance.get("/api/v1/openai/models");
  return response.data;
};
