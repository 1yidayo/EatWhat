function BackButton({ onClick }) {
  return (
    <div className="back-btn" onClick={onClick}>
      ← 返回
    </div>
  );
}

import MoodChat from "./components/MoodChat";
import { useState } from "react";
import "./style.css";

import FoodCard from "./components/FoodCard";
import RestaurantCard from "./components/RestaurantCard";
import { searchRestaurants } from "./api";

export default function App() {
  const [step, setStep] = useState(0);

  const [budget, setBudget] = useState(null);
  const [taste, setTaste] = useState(null);
  const [temp, setTemp] = useState(null);

  const [finalFood, setFinalFood] = useState(null);
  const [nearby, setNearby] = useState([]);

  function startFlow() {
    setStep(1);
  }

  function chooseBudget(val) {
    setBudget(val);
    setStep(2);
  }

  function chooseTaste(val) {
    setTaste(val);
    setStep(3);
  }

  // 🔥 由 AI 回傳三道料理
  async function chooseTemp(val) {
    setTemp(val);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget,
          taste,
          temp: val,
          message: "請根據以上條件推薦三道料理。"
        })
      });

      const data = await res.json();

      setFinalFood(data.options); // <- 三道料理陣列
      setStep(4);

    } catch (err) {
      alert("AI 推薦失敗，請稍後再試！");
    }
  }

  async function findNearby() {
    if (!finalFood || finalFood.length === 0) return;

    const key = finalFood[0].name; // <--- 修正：取第一個選擇料理
    const r = await searchRestaurants(key);
    setNearby(r.results || []);
  }

  function restart() {
    setBudget(null);
    setTaste(null);
    setTemp(null);
    setFinalFood(null);
    setNearby([]);
    setStep(0);
  }

  return (
    <div className="page">
      <header className="header">
        <h1>🍽 EatWhat?!</h1>
        <p>不知道要吃什麼？我幫你選！</p>
      </header>

      <div className="container">

        {/* STEP 0 – 開始 */}
        {step === 0 && (
          <div className="center-box">
            <button className="big-btn" onClick={startFlow}>
              開始決定 🍽
            </button>
          </div>
        )}

        <div className="center-box">
          <button className="big-btn secondary" onClick={() => setStep("mood")}>
            心情聊天室 🧠
          </button>
        </div>

        {/* STEP 1 – 預算 */}
        {step === 1 && (
          <>
            <BackButton onClick={() => setStep(0)} />
            <h2>你的預算大概是？</h2>
            <div className="options">
              {["100 以下", "150", "200", "不在意"].map((b) => (
                <button key={b} onClick={() => chooseBudget(b)}>
                  {b}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 – 口味 */}
        {step === 2 && (
          <>
            <BackButton onClick={() => setStep(1)} />
            <h2>你想吃清爽的還是重口味？</h2>
            <div className="options">
              <button onClick={() => chooseTaste("清爽")}>清爽</button>
              <button onClick={() => chooseTaste("重口味")}>重口味</button>
            </div>
          </>
        )}

        {/* STEP 3 – 熱還是冷 */}
        {step === 3 && (
          <>
            <BackButton onClick={() => setStep(2)} />
            <h2>你想吃熱的還是冷的？</h2>
            <div className="options">
              <button onClick={() => chooseTemp("熱")}>熱</button>
              <button onClick={() => chooseTemp("冷")}>冷</button>
            </div>
          </>
        )}

        {/* STEP 4 – 三道料理選擇 */}
        {step === 4 && finalFood && (
          <>
            <h2>🎉 這三道料理最適合你！</h2>

            {/* 三道選擇 */}
            <div className="food-options">
              {finalFood.map((item, idx) => (
                <div key={idx} onClick={() => setFinalFood([item])}>
                  <FoodCard
                    food={{
                      name: item.name,
                      desc: item.desc,
                      image: "https://source.unsplash.com/400x300/?" + item.image_keyword,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* 再抽三道料理 */}
            {finalFood.length > 1 && (
              <button
                className="big-btn secondary"
                onClick={() => chooseTemp(temp)}
              >
                重新抽三個 🔄
              </button>
            )}

            {/* 若點選其中一個 */}
            {finalFood.length === 1 && (
              <>
                <button className="big-btn" onClick={restart}>重新開始 🔄</button>


                <button className="big-btn" onClick={findNearby}>
                  查看附近的「{finalFood[0].name}」店 📍
                </button>

                {nearby.length > 0 && (
                  <div className="section">
                    <h2>附近餐廳</h2>
                    {nearby.map((r, i) => (
                      <RestaurantCard key={i} r={r} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}


        {/* 心情聊天室 */}
        {step === "mood" && (
          <>
            <BackButton onClick={() => setStep(0)} />

            <MoodChat
              onFoodSelect={(foodText) => {
                const dish = foodText.split("\n")[0];
                setFinalFood({
                  name: dish,
                  desc: "根據你的心情推薦的料理",
                  image: "https://source.unsplash.com/400x300/?" + dish,
                });
                setStep(4);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
