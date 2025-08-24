import { axiosInstance } from "@/entities/api/axios-instance";
import { ChatRequest, ChatResponse, StreamingChunk } from "@sse-chatbot/shared";

// 일반 채팅 API
export const postChat = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await axiosInstance.post("/api/v1/openai/chat", request);
  return response.data;
};

// SSE 기반 스트리밍 채팅 API
export const streamChat = (
  request: ChatRequest,
  onChunk: (chunk: StreamingChunk) => void,
  onComplete: () => void,
  onError: (error: string) => void
): (() => void) | undefined => {
  try {
    // POST 요청을 위한 URLSearchParams 사용
    const params = new URLSearchParams();
    params.append("data", JSON.stringify(request));

    const eventSource = new EventSource(
      `${axiosInstance.defaults.baseURL}/api/v1/openai/chat/stream?${params.toString()}`,
      { withCredentials: false }
    );

    // 메시지 수신 처리
    eventSource.onmessage = (event) => {
      try {
        if (event.data.trim()) {
          const chunk: StreamingChunk = JSON.parse(event.data);
          onChunk(chunk);

          if (chunk.type === "done" || chunk.type === "error") {
            if (chunk.type === "error") {
              onError(chunk.error || "스트리밍 오류가 발생했습니다.");
            }
            eventSource.close();
            onComplete();
          }
        }
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError);
      }
    };

    // 에러 처리
    eventSource.onerror = (event) => {
      console.error("EventSource 에러:", event);
      eventSource.close();
      onError("SSE 연결 중 오류가 발생했습니다.");
      onComplete();
    };

    // 연결 열림 처리
    eventSource.onopen = () => {
      console.log("SSE 연결이 열렸습니다.");
    };

    // 연결 종료 시 정리
    const cleanup = () => {
      eventSource.close();
    };

    // 컴포넌트 언마운트 시 정리를 위한 함수 반환
    return cleanup;
  } catch (error) {
    console.error("SSE 연결 오류:", error);
    onError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    onComplete();
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
