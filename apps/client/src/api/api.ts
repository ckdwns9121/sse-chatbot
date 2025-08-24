import { axiosInstance } from "@/entities/api/axios-instance";
import { ChatRequest, ChatResponse, StreamingChunk } from "@sse-chatbot/shared";

// 일반 채팅 API
export const postChat = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await axiosInstance.post("/api/v1/openai/chat", request);
  return response.data;
};

// 스트리밍 채팅 API
export const streamChat = async (
  request: ChatRequest,
  onChunk: (chunk: StreamingChunk) => void,
  onComplete: () => void,
  onError: (error: string) => void
) => {
  try {
    const response = await fetch(`${axiosInstance.defaults.baseURL}/api/v1/openai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body reader not available");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // 마지막 라인은 완전하지 않을 수 있으므로 버퍼에 남겨둠
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = line.slice(6); // 'data: ' 제거
            if (data.trim()) {
              const chunk: StreamingChunk = JSON.parse(data);
              onChunk(chunk);

              if (chunk.type === "done" || chunk.type === "error") {
                if (chunk.type === "error") {
                  onError(chunk.error || "스트리밍 오류가 발생했습니다.");
                }
                onComplete();
                return;
              }
            }
          } catch (parseError) {
            console.error("JSON 파싱 오류:", parseError);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    console.error("스트리밍 오류:", error);
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
