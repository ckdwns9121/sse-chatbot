import { useChat } from "../hooks/useChat";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = () => {
  const {
    messages,
    inputText,
    isLoading,
    messagesEndRef,
    setInputText,
    handleSendMessage,
    handleKeyPress,
    formatTime,
  } = useChat();

  return (
    <div className="chat-container">
      <ChatHeader />

      <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} formatTime={formatTime} />

      <MessageInput
        inputText={inputText}
        isLoading={isLoading}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default Chat;
