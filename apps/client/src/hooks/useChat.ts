import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, ChatRequest, StreamingChunk } from "@sse-chatbot/shared";
import { establishSSEConnection, sendStreamChatMessage, checkOpenAIStatus } from "@/api/api";
import { useScrollBottom } from "./useScrollBottom";
import { useCheckOpenAIStatus } from "./useCheckOpenAIStatus";

export const useChat = () => {
  const { messagesEndRef, scrollToBottom } = useScrollBottom();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! OpenAI 챗봇입니다. 무엇을 도와드릴까요?",
      timestamp: new Date(),
    },
  ]);
  const { openAIStatus } = useCheckOpenAIStatus();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const cleanupRef = useRef<(() => void) | null>(null);
  const tempBotMessageIdRef = useRef<string>("");

  // 에러 처리 헬퍼 함수
  const handleError = useCallback((error: string) => {
    console.error("스트리밍 에러:", error);
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.content = `오류가 발생했습니다: ${error}`;
      }
      return newMessages;
    });
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // SSE 메시지 수신 처리를 위한 콜백 함수 (메모이제이션)
  const handleSSEMessage = useCallback(
    (chunk: StreamingChunk) => {
      console.log("SSE 메시지 수신:", chunk);

      if (chunk.type === "text") {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === tempBotMessageIdRef.current
              ? { ...message, content: message.content + chunk.content }
              : message
          )
        );
      } else if (chunk.type === "done") {
        // 스트리밍 완료
        setIsStreaming(false);
        setIsLoading(false);
      } else if (chunk.type === "error") {
        handleError(chunk.error || "스트리밍 오류가 발생했습니다.");
      }
    },
    [handleError]
  );

  // SSE 에러 처리를 위한 콜백 함수 (메모이제이션)
  const handleSSEError = useCallback(
    (error: string) => {
      console.error("SSE 연결 오류:", error);
      handleError(error);
    },
    [handleError]
  );

  // 컴포넌트 마운트 시 SSE 연결 수립 (한 번만)
  useEffect(() => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);

    // SSE 연결 수립
    const cleanup = establishSSEConnection(newSessionId, handleSSEMessage, handleSSEError);

    cleanupRef.current = cleanup;

    // 컴포넌트 언마운트 시 cleanup 실행
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [handleSSEMessage, handleSSEError]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setIsStreaming(true);

    // 스트리밍 응답을 위한 임시 메시지 생성
    const tempBotMessageId = (Date.now() + 1).toString();
    tempBotMessageIdRef.current = tempBotMessageId;

    const tempBotMessage: ChatMessage = {
      id: tempBotMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempBotMessage]);

    try {
      const chatRequest: ChatRequest = {
        messages: [...messages, userMessage],
        sessionId: sessionId,
        modelConfig: {
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
      };

      // POST 요청으로 메시지 전송 (SSE 연결은 이미 수립되어 있음)
      await sendStreamChatMessage(chatRequest);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      const errorMessage = error instanceof Error ? error.message : "메시지 전송에 실패했습니다. 다시 시도해주세요.";
      handleError(errorMessage);
    }
  }, [inputText, isLoading, isStreaming, messages, sessionId, handleError]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return {
    messages,
    inputText,
    isLoading,
    isStreaming,
    openAIStatus,
    messagesEndRef,
    setInputText,
    handleSendMessage,
    handleKeyPress,
    formatTime,
  };
};
