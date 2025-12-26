import { useState } from "react";
import { chat } from "../api";
import "./mood.css";

export default function MoodChat({ onFoodSelect }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");

  // chat：純陪伴聊天
  // ask：詢問是否要進入正式推薦
  const [stage, setStage] = useState("chat");

  // ⭐ 是否已經問過推薦（避免一直煩）
  const [askedRecommend, setAskedRecommend] = useState(false);

  async function send() {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    // 顯示使用者訊息
    setMsgs((m) => [...m, { role: "user", text: userText }]);

    /* =========================
       1️⃣ 純聊天 + 安慰 + 料理建議
    ========================= */
    if (stage === "chat") {
      const reply = await chat(
        `你是一位溫柔、善於傾聽的陪伴者。

請依照以下順序回應：
1. 先具體回應使用者的情緒或身體狀況（不要套話）
2. 再自然推薦 1–2 種「適合的料理」，並簡短說明原因
3. 語氣溫柔，不要說教
4. 不要問問題，不要提到系統或功能

使用者狀況：
${userText}`
      );

      setMsgs((m) => [
        ...m,
        { role: "bot", text: reply?.reply || "我懂你的感受，慢慢來 💛" },
      ]);

      // ⭐ 只有第一次才詢問是否進入正式推薦
      if (!askedRecommend) {
        setMsgs((m) => [
          ...m,
          {
            role: "bot",
            text: "如果你願意，我也可以幫你用系統幫你認真挑，順便找附近有賣的餐廳，要嗎？🙂",
          },
        ]);
        setStage("ask");
        setAskedRecommend(true);
      }

      return;
    }

    /* =========================
       2️⃣ 是否進入正式推薦流程
    ========================= */
    if (stage === "ask") {
      const noWords = ["不要", "不用", "先不用", "沒關係"];
      const yesWords = ["要", "好", "可以", "需要", "想"];

      // ❌ 不要推薦 → 回到純聊天
      if (noWords.some((w) => userText.includes(w))) {
        setMsgs((m) => [
          ...m,
          {
            role: "bot",
            text: "好，那我就先陪你聊聊天就好 💛 你慢慢說。",
          },
        ]);
        setStage("chat");
        return;
      }

      // ✅ 要推薦 → 通知 App.jsx
      if (yesWords.some((w) => userText.includes(w))) {
        setMsgs((m) => [
          ...m,
          {
            role: "bot",
            text: "好，那我交給系統幫你認真挑適合你的料理 👌",
          },
        ]);

        onFoodSelect?.({
          type: "CONFIRM_RECOMMEND",
          mood: userText,
        });

        setStage("chat");
        return;
      }

      // 🤔 模糊回答
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "你可以直接跟我說「要」或「先不用」，我都可以 🙂",
        },
      ]);
    }
  }

  return (
    <div className="mood-box">
      <h2>
        <i className="fi fi-br-heart"></i> 心情聊天室
      </h2>

      <p>先跟我聊聊你的心情或身體狀況，我會陪你。</p>

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
          placeholder="例如：壓力好大、有點累、很冷..."
        />
        <button onClick={send}>送出</button>
      </div>
    </div>
  );
}
