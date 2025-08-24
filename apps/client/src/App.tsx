import "./App.css";
import Chat from "./components/Chat";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 SSE 채팅봇</h1>
      </header>
      <main className="app-main">
        <Chat />
      </main>
    </div>
  );
}

export default App;
