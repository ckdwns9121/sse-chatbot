import React from "react";

interface MessageInputProps {
  inputText: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  isLoading,
  onInputChange,
  onSendMessage,
  onKeyPress,
}) => {
  return (
    <div className="input-container">
      <textarea
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyPress}
        placeholder="메시지를 입력하세요..."
        rows={1}
        className="message-input"
      />
      <button onClick={onSendMessage} disabled={!inputText.trim() || isLoading} className="send-button">
        전송
      </button>
    </div>
  );
};

export default MessageInput;
