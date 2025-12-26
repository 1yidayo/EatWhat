// src/api.js
const BASE = "http://127.0.0.1:8000";

// --- 取得使用者定位 ---
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      }
    );
  });
}

// --- AI 聊天 ---
export async function chat(message) {
  const res = await fetch(BASE + "/chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

// --- Google Places 搜尋附近餐廳（⭐重點在這） ---
export async function searchRestaurants(keyword) {
  try {
    // ⭐ 嘗試取得使用者位置
    const { lat, lng } = await getUserLocation();

    const url =
      `${BASE}/restaurants/?keyword=${encodeURIComponent(keyword)}` +
      `&lat=${lat}&lng=${lng}`;

    const res = await fetch(url);
    return await res.json();

  } catch (err) {
    console.warn("⚠️ 無法取得定位，改用一般搜尋", err);

    // ❗定位失敗就退回不帶位置搜尋
    const res = await fetch(
      `${BASE}/restaurants/?keyword=${encodeURIComponent(keyword)}`
    );
    return await res.json();
  }
}
