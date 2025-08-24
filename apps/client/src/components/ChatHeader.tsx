interface ChatHeaderProps {
  openAIStatus: { apiKeyValid: boolean } | null;
}

const ChatHeader = ({ openAIStatus }: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      <h2>💬 OpenAI 채팅</h2>
      {openAIStatus && (
        <div className={`status-indicator ${openAIStatus.apiKeyValid ? "status-ok" : "status-error"}`}>
          {openAIStatus.apiKeyValid ? "🟢 연결됨" : "🔴 연결 안됨"}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
