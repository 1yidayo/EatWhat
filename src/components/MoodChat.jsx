import { useState } from "react";
import { chat } from "../api";
import "./mood.css";

export default function MoodChat({ onFoodSelect }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input.trim()) return;

    const newMsgs = [...msgs, { role: "user", text: input }];
    setMsgs(newMsgs);

    // 呼叫後端 chat API
    const reply = await chat(
      `使用者心情狀況：${input}。請根據心情、身體狀況推薦適合的料理，只回傳料理名稱與理由。`
    );

    const foodSuggestion = reply.reply;
    setMsgs([...newMsgs, { role: "bot", text: foodSuggestion }]);

    // 讓主頁可以收到食物結果
    onFoodSelect(foodSuggestion);

    setInput("");
  }

  return (
    <div className="mood-box">
      <h2>🧠 心情聊天室</h2>
      <p>告訴我你現在的心情或身體狀況，我幫你推薦舒服的料理。</p>

      <div className="mood-chat-window">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="mood-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：覺得很冷、壓力大、想吃安慰食物..."
        />
        <button onClick={send}>送出</button>
      </div>
    </div>
  );
}
