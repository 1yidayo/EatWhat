// src/api.js
const BASE = "http://127.0.0.1:8000";
const GOOGLE_KEY = "AIzaSyC2BsrNI86vs3NEN3VIkuS8vCxHBWi4Upw"; // ← 必填

// --- AI 聊天 / 餐點推薦 ---
export async function chat(message) {
  const res = await fetch(BASE + "/chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return res.json();
}

// --- 三道料理推薦 API（若你會用到） ---
export async function recommendAPI(preference) {
  const res = await fetch(BASE + "/recommend/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preference })
  });
  return res.json();
}

// --- Google Places 搜尋附近餐廳 ---
export async function searchRestaurants(keyword, lat, lng) {
  let url = `http://127.0.0.1:8000/restaurants/?keyword=${encodeURIComponent(keyword)}`;

  if (lat && lng) {
    url += `&lat=${lat}&lng=${lng}`;
  }

  const res = await fetch(url);
  return res.json();
}

