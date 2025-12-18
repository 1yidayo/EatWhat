export default function RecommendationCards({ items }) {
  return (
    <div>
      <h2><i class="fi fi-br-social-network"></i> 推薦給你</h2>
      {items.map((item, i) => (
        <div key={i} className="food-card">
          {item}
        </div>
      ))}
    </div>
  );
}
