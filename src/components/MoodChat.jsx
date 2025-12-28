import { useState } from "react";
import { chat } from "../api";
import "./mood.css";

export default function MoodChat({ onFoodSelect }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMsgs((m) => [...m, { role: "user", text: userText }]);

    /* =========================
       🔴 明確「要系統推薦」
    ========================= */
    const strongRecommendWords = [
      "推薦我",
      "幫我推薦",
      "推薦餐廳",
      "幫我找吃的",
    ];

    if (strongRecommendWords.some((w) => userText.includes(w))) {
      setMsgs((m) => [
        ...m,
        { role: "bot", text: "好，那我來幫你認真挑適合你的選擇 🍽️" },
      ]);

      onFoodSelect?.({
        type: "CONFIRM_RECOMMEND",
        mood: userText,
      });
      return;
    }

    /* =========================
       🟡 餓了 / 吃什麼 → 給建議
    ========================= */
    const hungryWords = ["餓", "肚子餓"];
    const eatAskWords = ["吃什麼", "可以吃", "吃啥"];

    if (
      hungryWords.some((w) => userText.includes(w)) ||
      eatAskWords.some((w) => userText.includes(w))
    ) {
      const reply = await chat(
        `你是一位溫柔、體貼的陪伴者。

請遵守：
1. 先回應使用者現在的狀態
2. 再給 1–2 個「方向性的飲食建議」（例如清淡、溫暖）
3. 不提餐廳、不說系統、不跳轉
4. 語氣自然像朋友

使用者狀況：
${userText}`
      );

      setMsgs((m) => [
        ...m,
        { role: "bot", text: reply?.reply || "或許吃點溫暖、清淡的東西會舒服些。" },
      ]);
      return;
    }

    /* =========================
       🟢 純陪伴聊天
    ========================= */
    const reply = await chat(
      `你是一位溫柔、善於傾聽的陪伴者。

請遵守：
1. 回應情緒或狀況
2. 不提食物
3. 不給建議
4. 不問問題
5. 1–2 句即可

使用者狀況：
${userText}`
    );

    setMsgs((m) => [
      ...m,
      { role: "bot", text: reply?.reply || "我在這裡陪你，你慢慢說 💛" },
    ]);
  }

  return (
    <div className="mood-box">
      <h2>💛 心情聊天室</h2>

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
          placeholder="想說什麼都可以…"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>送出</button>
      </div>
    </div>
  );
}