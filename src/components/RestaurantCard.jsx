export default function RestaurantCard({ r }) {
  const photo = r.photos?.[0]?.photo_reference
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${r.photos[0].photo_reference}&key=YOUR_GOOGLE_API_KEY`
    : "https://via.placeholder.com/400x250?text=No+Image";

  return (
    <div className="restaurant-card">
      <img src={photo} alt={r.name} />
      <div className="restaurant-info">
        <h3>{r.name}</h3>
        <p>⭐ {r.rating || "無評分"}</p>
        <p>{r.vicinity}</p>
      </div>
    </div>
  );
}
