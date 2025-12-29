export default function FoodCard({ food, showRestaurantInfo = false, children, single = false }) {
  function formatPrice(level) {
    switch (level) {
      case 0:
      case 1:
        return "低";
      case 2:
        return "中等";
      case 3:
      case 4:
        return "高";
      default:
        return "無價格資訊";
    }
  }

  return (
    <div
      className={`food-card ${single ? "single-card" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxWidth: single ? "100%" : "100%", // 單一卡拓寬
        margin: single ? "0 auto" : "0", // 居中
      }}
    >

      {food.photo_url && (
        <div className="food-image">
          <img
            src={food.photo_url}
            alt={food.name}
            style={{ width: "100%", borderRadius: "10px" }}
          />
        </div>
      )}

      <div className="food-info" style={{ marginBottom: "-25px" }}>
        <h3>{String(food.name)}</h3>
        <p>{String(food.desc)}</p>

        {/* 這裡放 children，按鈕就會顯示在文字下方 */}
      </div>

      {showRestaurantInfo &&
        (food.restaurant_name || food.rating || food.price_level || food.address) && (
          <div
            className="restaurant-info"
            style={{ margin: "10px", fontSize: "15px", color: "#555" }}
          >
            {food.restaurant_name && <div>🏠 店名：{food.restaurant_name}</div>}
            {food.rating && <div>⭐ 評分：{food.rating}</div>}
            {food.price_level !== undefined && (
              <div>💰 價格：{formatPrice(food.price_level)}</div>
            )}
            {food.address && <div>📍 地址：{food.address}</div>}
          </div>
        )}

      {children && <div
        style={{ marginTop: "auto", textAlign: "center", flexDirection: "column" }}>{children}
      </div>}
    </div>
  );
}
