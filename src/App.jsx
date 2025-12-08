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

  function chooseTemp(val) {
    setTemp(val);

    // ⭐ AI 模擬決策（你之後可以換成後端 API）
    const food = decideFood(val);
    setFinalFood(food);

    setStep(4);
  }

  function decideFood() {
    // ⭐ 根據使用者回答進行「決策樹」食物推薦
    if (budget === "100 以下") {
      if (taste === "清爽" && temp === "冷") return sample("涼麵");
      if (taste === "清爽" && temp === "熱") return sample("蔬食湯麵");
      if (taste === "重口味") return sample("滷肉飯");
    }
    if (budget === "150") {
      if (taste === "清爽") return sample("雞肉沙拉");
      if (taste === "重口味") return sample("咖哩飯");
    }
    if (budget === "200" || budget === "不在意") {
      if (taste === "清爽") return sample("壽司");
      if (taste === "重口味") return sample("韓式燒肉飯");
    }
    return sample("義大利麵");
  }

  function sample(name) {
    return {
      name,
      desc: "根據你的喜好推薦的今日料理",
      image: "https://source.unsplash.com/400x300/?" + name,
    };
  }

  async function findNearby() {
    const key = finalFood.name;
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
            <h2>你想吃熱的還是冷的？</h2>
            <div className="options">
              <button onClick={() => chooseTemp("熱")}>熱</button>
              <button onClick={() => chooseTemp("冷")}>冷</button>
            </div>
          </>
        )}

        {/* STEP 4 – 最終推薦結果 */}
        {step === 4 && finalFood && (
          <>
            <h2>🎉 我幫你選好了！</h2>
            <FoodCard food={finalFood} />

            <button className="big-btn" onClick={restart}>
              重新開始 🔄
            </button>

            <button className="big-btn" onClick={findNearby}>
              查看附近的「{finalFood.name}」店 📍
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
        {step === "mood" && (
          <MoodChat
            onFoodSelect={(foodText) => {
              // 解析 AI 回傳的食物名稱
              const dish = foodText.split("\n")[0];
              setFinalFood({
                name: dish,
                desc: "根據你的心情推薦的料理",
                image: "https://source.unsplash.com/400x300/?" + dish,
              });
              setStep(4);
            }}
          />
        )}
      </div>
    </div>
  );
}
