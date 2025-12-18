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
      setFinalFood(data.options);
      setStep(4);
    } catch {
      alert("AI 推薦失敗，請稍後再試！");
    }
  }

  async function findNearby() {
    if (!finalFood || finalFood.length === 0) return;
    const key = finalFood[0].name;
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
        <div className="main-card">
          {/* ================= 主內容區 ================= */}
          <div className="flow-area">
            {/* STEP 0 */}
            {step === 0 && (
              <div className="center-box">
                <button className="big-btn" onClick={startFlow}>
                  <i className="fi fi-br-utensils"></i>
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
                  <button onClick={() => chooseTaste("重口味")}>
                    重口味
                  </button>
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

            {/* STEP 4 */}
            {step === 4 && finalFood && (
              <>
                <h2>
                  <i className="fi fi-br-care"></i>
                  這三道料理最適合你
                </h2>

                <div className="food-options">
                  {finalFood.map((item, idx) => (
                    <div key={idx} onClick={() => setFinalFood([item])}>
                      <FoodCard
                        food={{
                          name: item.name,
                          desc: item.desc,
                          image:
                            "https://source.unsplash.com/400x300/?" +
                            item.image_keyword,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {finalFood.length > 1 && (
                  <button
                    className="big-btn secondary"
                    onClick={() => chooseTemp(temp)}
                  >
                    <i className="fi fi-br-refresh"></i>
                    重新抽三個
                  </button>
                )}

                {finalFood.length === 1 && (
                  <>
                    <button className="big-btn" onClick={restart}>
                      <i className="fi fi-br-refresh"></i>
                      重新開始
                    </button>

                    <button className="big-btn" onClick={findNearby}>
                      查看附近的「{finalFood[0].name}」📍
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

            {/* ===== 心情聊天室本體（一定要有） ===== */}
            {step === "mood" && (
              <>
                <BackButton onClick={() => setStep(0)} />
                <MoodChat
                  onFoodSelect={(foodText) => {
                    const dish = foodText.split("\n")[0];
                    setFinalFood([
                      {
                        name: dish,
                        desc: "根據你的心情推薦的料理",
                        image:
                          "https://source.unsplash.com/400x300/?" + dish,
                      },
                    ]);
                    setStep(4);
                  }}
                />
              </>
            )}
          </div>

          {/* ================= 底部互斥入口 ================= */}
          {step === "mood" ? (
            <>
              <div className="divider">或</div>
              <div className="mood-entry">
                <button className="big-btn" onClick={() => setStep(0)}>
                  <i className="fi fi-br-utensils"></i>
                  開始決定
                </button>
                <p className="hint">改用條件選擇料理</p>
              </div>
            </>
          ) : (
            <>
              <div className="divider">或</div>
              <div className="mood-entry">
                <button
                  className="big-btn mood"
                  onClick={() => setStep("mood")}
                >
                  <i className="fi fi-br-heart"></i>
                  心情聊天室
                </button>
                <p className="hint">
                  用心情聊聊，讓 EatWhat?! 更懂你
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
