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
  const [allOptions, setAllOptions] = useState([]);
  const [nearby, setNearby] = useState([]);

  // ⭐ 排序方式（預設距離）
  const [sortBy, setSortBy] = useState("distance");

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
      setAllOptions(data.options);
      setNearby([]);
      setStep(4);
    } catch {
      alert("AI 推薦失敗，請稍後再試！");
    }
  }

  // ⭐ 查詢附近餐廳（只用電腦定位）
  async function findNearby() {
    if (!finalFood || finalFood.length === 0) return;

    const keyword = finalFood[0].name + " 餐廳";

    if (!navigator.geolocation) {
      alert("瀏覽器不支援定位功能");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const r = await searchRestaurants(keyword, latitude, longitude);
        setNearby(r.results || []);
        setSortBy("distance");
      },
      () => {
        alert("⚠️ 無法取得定位，請允許定位權限");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
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

  // ⭐ 排序邏輯（Google Maps 風格）
  function getSortedRestaurants() {
    const list = [...nearby];

    switch (sortBy) {
      case "rating":
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "price_low":
        return list.sort(
          (a, b) => (a.price_level ?? 99) - (b.price_level ?? 99)
        );
      case "price_high":
        return list.sort((a, b) => (b.price_level ?? 0) - (a.price_level ?? 0));
      case "distance":
      default:
        return list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
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
            {step === 0 && (
              <div className="center-box">
                <button className="big-btn" onClick={startFlow}>
                  開始決定
                </button>
              </div>
            )}

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

            {step === 4 && finalFood && (
              <>
                <BackButton
                  onClick={() => {
                    finalFood.length === 1
                      ? setFinalFood(allOptions)
                      : setStep(3);
                    setNearby([]);
                  }}
                />

                <h2>這三道料理最適合你</h2>

                <div className="food-options">
                  {finalFood.map((item, idx) => (
                    <div key={idx} onClick={() => setFinalFood([item])}>
                      <FoodCard food={item} />
                    </div>
                  ))}
                </div>

                {finalFood.length === 1 && (
                  <>
                    <button className="big-btn" onClick={findNearby}>
                      查看附近餐廳
                    </button>

                    {nearby.length > 0 && (
                      <div className="section">
                        <h2>附近餐廳</h2>

                        <div className="sort-bar">
                          <button
                            className={sortBy === "distance" ? "active" : ""}
                            onClick={() => setSortBy("distance")}
                          >
                            📍 距離
                          </button>
                          <button
                            className={sortBy === "rating" ? "active" : ""}
                            onClick={() => setSortBy("rating")}
                          >
                            ⭐ 評分
                          </button>
                          <button
                            className={sortBy === "price_low" ? "active" : ""}
                            onClick={() => setSortBy("price_low")}
                          >
                            💰 低價
                          </button>
                          <button
                            className={sortBy === "price_high" ? "active" : ""}
                            onClick={() => setSortBy("price_high")}
                          >
                            💰 高價
                          </button>
                        </div>

                        <div className="restaurant-scroll">
                          {getSortedRestaurants().map((r, i) => (
                            <RestaurantCard key={i} r={r} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

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

          {step !== "mood" ? (
            <>
              <div className="divider">或</div>
              <div className="mood-entry">
                <button
                  className="big-btn mood"
                  onClick={() => setStep("mood")}
                >
                  心情聊天室
                </button>
                <p className="hint">用心情聊聊，讓 EatWhat?! 更懂你</p>
              </div>
            </>
          ) : (
            <>
              <div className="divider">或</div>
              <div className="mood-entry">
                <button className="big-btn" onClick={() => setStep(1)}>
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
