import { useState } from "react";
import { chat } from "../api";

export default function ChatBox({ onGoRecommend }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");

  // chat | ask_food | recommend_ready
  const [stage, setStage] = useState("chat");

  // ⭐ 是否進入「只陪聊，不導向功能」模式
  const [chatOnly, setChatOnly] = useState(false);

  async function send() {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");

    // 顯示使用者訊息
    setMsgs((m) => [...m, { role: "user", text: userMsg }]);

    /* =========================
       Stage 1：純聊天 / 陪伴
    ========================= */
    if (stage === "chat") {
      const reply = await chat(
        chatOnly
          ? `你是一位溫柔、耐心、會回應細節的陪伴者。
請針對使用者的話給出具體、貼近的安慰與回應，
不要重複套話，不要提到吃的或任何功能：
${userMsg}`
          : `你是一位溫柔、善於傾聽的陪伴者，
請先共感、安慰使用者，不要推薦食物：
${userMsg}`
      );

      const nextMsgs = [{ role: "bot", text: reply.reply }];

      // ⭐ 只有在「非 chatOnly」時，才詢問要不要推薦
      if (!chatOnly) {
        nextMsgs.push({
          role: "bot",
          text: "如果你願意，我也可以幫你用系統幫你認真挑適合的料理，要嗎？🙂",
        });
        setStage("ask_food");
      }

      setMsgs((m) => [...m, ...nextMsgs]);
      return;
    }

    /* =========================
       Stage 2：詢問是否要推薦
    ========================= */
    if (stage === "ask_food") {
      const yesWords = ["好", "要", "需要", "想", "可以"];
      const noWords = ["不用", "先不用", "不要", "沒關係"];

      if (yesWords.some((w) => userMsg.includes(w))) {
        setMsgs((m) => [
          ...m,
          {
            role: "bot",
            text: "好，那我交給系統幫你認真挑 👌",
          },
        ]);

        setStage("recommend_ready");
        return;
      }

      if (noWords.some((w) => userMsg.includes(w))) {
        setMsgs((m) => [
          ...m,
          {
            role: "bot",
            text: "好，那我先陪你聊聊天就好 💛 你想說什麼都可以。",
          },
        ]);

        // ⭐ 關鍵：進入純陪聊模式
        setChatOnly(true);
        setStage("chat");
        return;
      }

      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "你可以直接跟我說「要」或「先不用」，我都可以 😊",
        },
      ]);
      return;
    }

    /* =========================
       Stage 3：是否跳轉推薦頁
    ========================= */
    if (stage === "recommend_ready") {
      if (userMsg.includes("好") || userMsg.includes("要")) {
        setMsgs((m) => [
          ...m,
          {
            role: "bot",
            text: "那我幫你整理好，帶你去看推薦 👣",
          },
        ]);

        // 🔔 通知父層（App.jsx）跳轉到你原本的推薦流程
        onGoRecommend?.();
        return;
      }

      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "沒問題～我們也可以再聊一下 😊",
        },
      ]);

      setChatOnly(true);
      setStage("chat");
    }
  }

  return (
    <div className="chat-box">
      <h3>🤖 EatWhat?! AI 助理</h3>

      <div style={{ height: "220px", overflowY: "auto" }}>
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
        placeholder="可以跟我說說你的狀況..."
      />
      <button className="chat-btn" onClick={send}>
        送出
      </button>
    </div>
  );
}
