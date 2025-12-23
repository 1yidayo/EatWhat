export default function RestaurantCard({ r }) {
  const photo = r.photo_url
    ? r.photo_url
    : "https://via.placeholder.com/400x250?text=No+Image";

  const address = r.address || r.vicinity || "無法取得地址";

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
  const priceText = priceMap[r.price_level] || "無價格資訊";

  // ===== 餐廳特色（types） =====
  const features =
    r.types
      ?.filter(
        (t) => !["point_of_interest", "establishment", "food"].includes(t)
      )
      .map((t) => t.replace(/_/g, " "))
      .join("、") || "無餐廳特色資訊";

  return (
    <div className="restaurant-card">
      <img src={photo} alt={r.name} />

      <div className="restaurant-info">
        <h3>{r.name}</h3>

        {r.rating && <p>⭐ 評分：{r.rating}</p>}

        <p>📍 {address}</p>

        <p>💰 價格：{priceText}</p>

        {r.features && r.features.length > 0 && (
        <p>🍽 特色：{r.features.join(" · ")}</p>
        )}

        

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
