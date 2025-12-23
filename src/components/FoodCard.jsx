export default function FoodCard({ food }) {
  return (
    <div className="food-card">

      <div className="food-info">
        <h3>{String(food.name)}</h3>
        <p>{String(food.desc)}</p>
      </div>
    </div>
  );
}

