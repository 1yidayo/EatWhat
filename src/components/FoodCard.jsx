export default function FoodCard({ food }) {
  return (
    <div className="food-card">
      <img src={food.image} alt={food.name} />
      <div className="food-info">
        <h3>{food.name}</h3>
        <p>{food.desc}</p>
      </div>
    </div>
  );
}
