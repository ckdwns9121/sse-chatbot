interface TypingIndicatorProps {
  isStreaming?: boolean;
}

const TypingIndicator = ({ isStreaming = false }: TypingIndicatorProps) => {
  return (
    <div className="message bot-message">
      <div className="message-content">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
        {isStreaming && (
          <div className="streaming-indicator">
            <span className="streaming-text">AI가 응답을 생성하고 있습니다...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingIndicator;
