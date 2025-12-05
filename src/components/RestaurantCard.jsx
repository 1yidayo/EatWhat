export default function RestaurantCard({ r }) {
  return (
    <div className="restaurant-card">
      <h3>{r.name}</h3>
      <p className="rating">⭐ {r.rating || "無評分"}</p>
      <p>{r.vicinity}</p>
    </div>
  );
}
