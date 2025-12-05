import { useState } from "react";
import { chat } from "../api";

export default function ChatBox() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input) return;

    setMsgs([...msgs, { role: "user", text: input }]);
    const reply = await chat(input);

    setMsgs((m) => [...m, { role: "bot", text: reply.reply }]);
    setInput("");
  }

  return (
    <div className="chat-box">
      <h3>🤖 EatWhat?! AI 助理</h3>

      <div style={{ height: "200px", overflowY: "auto" }}>
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <input
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="輸入訊息..."
      />
      <button className="chat-btn" onClick={send}>
        送出
      </button>
    </div>
  );
}
