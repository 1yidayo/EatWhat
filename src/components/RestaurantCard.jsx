export default function RestaurantCard({ r }) {
  // ===== 圖片 =====
  const photo = r.photo_url
    ? r.photo_url
    : "https://via.placeholder.com/400x250?text=No+Image";

  // ===== 地址 =====
  const address = r.address || r.vicinity || "無法取得地址";

  // ===== Google Maps 連結 =====
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${r.name} ${address}`
  )}`;

  // ===== 價格區間顯示 =====
  const priceMap = {
    0: "免費 / 非常便宜",
    1: "便宜 💲",
    2: "中等 💲💲",
    3: "偏貴 💲💲💲",
    4: "昂貴 💲💲💲💲",
  };

  const priceText =
    typeof r.price_level === "number" ? priceMap[r.price_level] : "無價格資訊";

  // ===== 距離顯示（⭐ 新增）=====
  function renderDistance(distance) {
    if (distance == null) return null;

    if (distance < 1000) {
      return `📍 距離：${distance} 公尺`;
    }
    return `📍 距離：${(distance / 1000).toFixed(1)} 公里`;
  }

  return (
    <div className="restaurant-card">
      {/* 圖片 */}
      <img src={photo} alt={r.name} />

      <div className="restaurant-info">
        {/* 店名 */}
        <h3>{r.name}</h3>

        {/* ⭐ 距離（新增，會自動判斷有沒有） */}
        {r.distance != null && (
          <p className="distance">{renderDistance(r.distance)}</p>
        )}

        {/* 評分 */}
        {r.rating && <p>⭐ 評分：{r.rating}</p>}

        {/* 地址 */}
        <p>🗺️ 地址：{address}</p>

        {/* 價格 */}
        <p>💰 價格：{priceText}</p>

        {/* 特色 */}
        {r.features && r.features.length > 0 && (
          <p>🍽️ 特色：{r.features.join(" · ")}</p>
        )}

        {/* Google Maps */}
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="map-btn"
        >
          ➜ 在 Google 地圖查看
        </a>
      </div>
    </div>
  );
}
