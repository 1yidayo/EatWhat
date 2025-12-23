export default function RestaurantCard({ r }) {
  const photo = r.photo_url
    ? r.photo_url
    : "https://via.placeholder.com/400x250?text=No+Image";

  const address = r.address || r.vicinity || "無法取得地址";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${r.name} ${address}`
  )}`;

  return (
    <div className="restaurant-card">
      <img src={photo} alt={r.name} />

      <div className="restaurant-info">
        <h3>{r.name}</h3>

        {r.rating && <p>⭐ 評分：{r.rating}</p>}

        <p>📍 {address}</p>

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
