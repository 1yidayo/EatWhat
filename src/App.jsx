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

/* ===============================
   心情 → 推薦條件轉換
================================ */
function mapMoodToPreference(moodText) {
  const text = moodText || "";

  if (text.includes("冷")) {
    return { budget: "不在意", taste: "清爽", temp: "熱" };
  }
  if (text.includes("壓力") || text.includes("累")) {
    return { budget: "200", taste: "重口味", temp: "熱" };
  }
  if (text.includes("熱") || text.includes("流汗")) {
    return { budget: "不在意", taste: "清爽", temp: "冷" };
  }

  return { budget: "150", taste: "清爽", temp: "熱" };
}

export default function App() {
  const [step, setStep] = useState(0);

  const [budget, setBudget] = useState(null);
  const [taste, setTaste] = useState(null);
  const [temp, setTemp] = useState(null);
  const [showNearby, setShowNearby] = useState(false);


  const [finalFood, setFinalFood] = useState(null);
  const [allOptions, setAllOptions] = useState([]);
  const [nearby, setNearby] = useState([]);

  const [sortBy, setSortBy] = useState("distance");

  // ⭐ 心情推薦狀態
  const [pendingRecommend, setPendingRecommend] = useState(false);
  const [moodText, setMoodText] = useState("");

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

  /* ===============================
     核心推薦（唯一來源）
  ================================ */
  async function chooseTemp(val, override = {}) {
    const finalBudget = override.budget ?? budget;
    const finalTaste = override.taste ?? taste;

    setTemp(val);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: finalBudget,
          taste: finalTaste,
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

  /* ===============================
     查詢附近餐廳
  ================================ */
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
      () => alert("⚠️ 無法取得定位，請允許定位權限"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

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
        <p>不知道要吃什麼？我陪你慢慢決定</p>
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

            {step === 4 && (
  <>
    {/* 無推薦料理 → 顯示請再試一次 */}
    {finalFood.length === 0 && (
  <div
    className="center-box"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    }}
  >
    <h2>
      目前沒有找到符合條件的料理 😢
    </h2>

    <button
      className="big-btn"
      onClick={() => setStep(3)}
    >
      返回重新選擇
    </button>
  </div>
)}



    {/* 有推薦料理 → 顯示正常流程 */}
    {finalFood.length > 0 && (
      <>
        <BackButton onClick={() => {
          if (finalFood.length === 1) {
            setFinalFood(allOptions);
          } else {
            setStep(3);
          }
        }} />

        <h2>這三道料理最適合你</h2>

        <div className="food-options">
          {finalFood.map((item, idx) => (
            <div
  key={idx}
  onClick={() => {
    setFinalFood([item]);
    setNearby([]);        // ← 不留上一次的結果
  }}
>

              <FoodCard food={item} />
            </div>
          ))}
        </div>

        {finalFood.length > 1 && (
          <button className="big-btn secondary" onClick={() => chooseTemp(temp)}>
            重新抽三個 🔄
          </button>
        )}

        {finalFood.length === 1 && (
          <>
            <button
  className="big-btn"
  onClick={async () => {
    setShowNearby(true);
    await findNearby();
  }}
>
  查看附近餐廳
</button>


            {nearby.length > 0 && (
              <div className="section">
                <div className="restaurant-scroll">
                  {nearby.map((r, i) => (
                    <RestaurantCard key={i} r={r} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </>
    )}
  </>
)}



            {/* ===== 心情聊天室 ===== */}
            {step === "mood" && (
              <>
                <BackButton onClick={() => setStep(0)} />

                <MoodChat
                  onFoodSelect={(payload) => {
                    if (payload?.type === "CONFIRM_RECOMMEND") {
                      setMoodText(payload.mood);
                      setPendingRecommend(true);
                    }
                  }}
                />

                {pendingRecommend && (
                  <div className="food-suggest-box">
                    <h3>🍽 要幫你認真挑適合的料理嗎？</h3>

                    <button
                      className="big-btn"
                      onClick={async () => {
                        const pref = mapMoodToPreference(moodText);

                        await chooseTemp(pref.temp, {
                          budget: pref.budget,
                          taste: pref.taste,
                        });

                        setMoodText("");
                        setPendingRecommend(false);
                      }}
                    >
                      開始推薦
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => setPendingRecommend(false)}
                    >
                      先不用，繼續聊
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="divider">或</div>
          <div className="mood-entry">
            <button
              className="big-btn mood"
              onClick={() => setStep(step === "mood" ? 1 : "mood")}
            >
              {step === "mood" ? "用條件選擇" : "心情聊天室"}
            </button>
            <p className="hint">
              {step === "mood"
                ? "改用條件選擇料理"
                : "聊聊心情，讓 EatWhat?! 更懂你"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
