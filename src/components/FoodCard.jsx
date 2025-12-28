export default function FoodCard({ food }) {
  if (!food) return null;

  return (
    <div className="food-card">
      <div className="food-info">
        <h3>{food.name}</h3>
        <p>{food.reason}</p>
      </div>
    </div>
  );
}
