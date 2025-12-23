import { useState } from "react";
import MoodChat from "./components/MoodChat";
import FoodCard from "./components/FoodCard";
import RestaurantCard from "./components/RestaurantCard";
import { searchRestaurants } from "./api";
import "./style.css";

function BackButton({ onClick }) {
  return (
    <div className="back-btn" onClick={onClick}>
      返回
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);

  const [budget, setBudget] = useState(null);
  const [taste, setTaste] = useState(null);
  const [temp, setTemp] = useState(null);

  const [finalFood, setFinalFood] = useState(null);
  const [allOptions, setAllOptions] = useState([]);  // ⭐ 新增：保存三道料理
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
          message: "請根據以上條件推薦三道料理。",
        }),
      });

      const data = await res.json();
      
      setFinalFood(data.options);   // 顯示三個
      setAllOptions(data.options);  // ⭐ 保存三個，不會遺失
      setNearby([]);
      setStep(4);

    } catch {
      alert("AI 推薦失敗，請稍後再試！");
    }
  }

  async function findNearby() {
    if (!finalFood || finalFood.length === 0) return;

    const key = finalFood[0].name + " 餐廳";
    const r = await searchRestaurants(key);

    setNearby(r.results || []);
  }

  function restart() {
    setBudget(null);
    setTaste(null);
    setTemp(null);
    setFinalFood(null);
    setAllOptions([]);
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
        <div className="main-card">
          <div className="flow-area">

            {/* STEP 0 */}
            {step === 0 && (
              <div className="center-box">
                <button className="big-btn" onClick={startFlow}>
                  開始決定
                </button>
              </div>
            )}

            {/* STEP 1 */}
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

            {/* STEP 2 */}
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

            {/* STEP 3 */}
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

            {/* STEP 4：顯示 3 道料理 or 單一料理 */}
            {step === 4 && finalFood && (
              <>
                {/* ⭐ 重點：返回 → 回到三選一，而不是 Step3 */}
                <BackButton
                  onClick={() => {
                    if (finalFood.length === 1) {
                      // 單選模式 → 回到三選一
                      setFinalFood(allOptions);
                    } else {
                      // 三選一模式 → 回到 Step3
                      setStep(3);
                    }
                    setNearby([]);
                  }}
                />

                <h2>這三道料理最適合你</h2>

                <div className="food-options">
                  {finalFood.map((item, idx) => (
                    <div key={idx} onClick={() => setFinalFood([item])}>
                      <FoodCard
                        food={{
                          name: item.name,
                          desc: item.desc,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* 重新抽三個 */}
                {finalFood.length > 1 && (
                  <button
                    className="big-btn secondary"
                    onClick={() => chooseTemp(temp)}
                  >
                    重新抽三個
                  </button>
                )}

                {/* 單選模式 */}
                {finalFood.length === 1 && (
                  <>
                    <button className="big-btn" onClick={restart}>
                      重新開始
                    </button>

                    <button className="big-btn" onClick={findNearby}>
                      查看附近的「{finalFood[0].name}」
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
                    setFinalFood([{ name: dish, desc: "心情推薦料理" }]);
                    setAllOptions([{ name: dish, desc: "心情推薦料理" }]);
                    setStep(4);
                  }}
                />
              </>
            )}
          </div>

          {/* 底部互斥入口 */}
          {step !== "mood" ? (
            <>
              <div className="divider">或</div>
              <div className="mood-entry">
                <button className="big-btn mood" onClick={() => setStep("mood")}>
                  心情聊天室
                </button>
                <p className="hint">用心情聊聊，讓 EatWhat?! 更懂你</p>
              </div>
            </>
          ) : (
            <>
              <div className="divider">或</div>
              <div className="mood-entry">
                <button className="big-btn" onClick={() => setStep(0)}>
                  開始決定
                </button>
                <p className="hint">改用條件選擇料理</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
