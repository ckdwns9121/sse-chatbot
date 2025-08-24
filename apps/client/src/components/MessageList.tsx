import { ChatMessage } from "@sse-chatbot/shared";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  formatTime: (date: Date) => string;
}

const MessageList = ({ messages, isLoading, isStreaming, messagesEndRef, formatTime }: MessageListProps) => {
  return (
    <div className="messages-container">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} formatTime={formatTime} />
      ))}

      {(isLoading || isStreaming) && <TypingIndicator isStreaming={isStreaming} />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
