export default function Tabs({ active, setActive }) {
  const tabs = ["Lunch", "Food", "Near", "Favorites"];

  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button
          key={t}
          className={active === t ? "active" : ""}
          onClick={() => setActive(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
