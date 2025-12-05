import { useState } from "react";
import "./style.css";
import ChatBox from "./components/ChatBox";
import RecommendationCards from "./components/RecommendationCards";
import RestaurantCard from "./components/RestaurantCard";
import { recommendAPI, searchRestaurants } from "./api";

export default function App() {
  const [recs, setRecs] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  async function doRecommend() {
    const pref = prompt("你現在想吃什麼？例如：清爽 / 重口味 / 快速");
    if (!pref) return;

    const r = await recommendAPI(pref);
    setRecs(r.items);
  }

  async function findRestaurants() {
    const keyword = prompt("想搜尋什麼餐廳？例如：壽司 / 火鍋");
    if (!keyword) return;

    const r = await searchRestaurants(keyword);
    setRestaurants(r.results || []);
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero">
        <h1>🍽 今天吃什麼？</h1>
        <p>讓 EatWhat?! AI 美食助理幫你決定！</p>
        <button onClick={doRecommend}>開始推薦</button>
      </section>

      <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
        {/* 推薦卡片 */}
        {recs.length > 0 && <RecommendationCards items={recs} />}

        {/* 餐廳搜尋 */}
        <button
          onClick={findRestaurants}
          style={{
            padding: "12px 20px",
            background: "#F97316",
            color: "white",
            border: "none",
            borderRadius: "10px",
            marginTop: "10px",
            width: "100%",
            fontSize: "16px",
          }}
        >
          搜尋附近餐廳
        </button>

        {restaurants.map((r, i) => (
          <RestaurantCard key={i} r={r} />
        ))}

        {/* 聊天區 */}
        <ChatBox />
      </div>
    </div>
  );
}
