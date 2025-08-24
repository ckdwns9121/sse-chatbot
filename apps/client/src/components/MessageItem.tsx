import { ChatMessage } from "@sse-chatbot/shared";

interface MessageItemProps {
  message: ChatMessage;
  formatTime: (date: Date) => string;
}

const MessageItem = ({ message, formatTime }: MessageItemProps) => {
  return (
    <div className={`message ${message.role === "user" ? "user-message" : "bot-message"}`}>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default MessageItem;
