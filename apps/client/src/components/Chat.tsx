import { useChat } from "../hooks/useChat";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = () => {
  const {
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
  } = useChat();

  return (
    <div className="chat-container">
      <ChatHeader openAIStatus={openAIStatus} />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        messagesEndRef={messagesEndRef}
        formatTime={formatTime}
      />

      <MessageInput
        inputText={inputText}
        isLoading={isLoading || isStreaming}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default Chat;
