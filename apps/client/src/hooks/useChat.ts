import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, ChatRequest, StreamingChunk } from "@sse-chatbot/shared";
import { streamChat, checkOpenAIStatus } from "@/api/api";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! OpenAI 챗봇입니다. 무엇을 도와드릴까요?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [openAIStatus, setOpenAIStatus] = useState<{ apiKeyValid: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // OpenAI 상태 확인
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkOpenAIStatus();
        setOpenAIStatus(status.data);
      } catch (error) {
        console.error("OpenAI 상태 확인 실패:", error);
        setOpenAIStatus({ apiKeyValid: false });
      }
    };
    checkStatus();
  }, []);

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
        sessionId: `session_${Date.now()}`,
        modelConfig: {
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
      };

      await streamChat(
        chatRequest,
        (chunk: StreamingChunk) => {
          console.log(chunk);
          if (chunk.type === "text") {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === tempBotMessageId ? { ...message, content: message.content + chunk.content } : message
              )
            );
          }
        },
        () => {
          // 스트리밍 완료
          setIsStreaming(false);
          setIsLoading(false);
        },
        (error: string) => {
          // 에러 발생
          handleError(error);
        }
      );
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      const errorMessage = error instanceof Error ? error.message : "메시지 전송에 실패했습니다. 다시 시도해주세요.";
      handleError(errorMessage);
    }
  }, [inputText, isLoading, isStreaming, messages]);

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
