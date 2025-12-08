export default function SearchBar({ onSearch }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search food..."
        onKeyDown={(e) => e.key === "Enter" && onSearch(e.target.value)}
      />
      <button
        onClick={() =>
          onSearch(document.querySelector(".search-bar input").value)
        }
      >
        🔍
      </button>
    </div>
  );
}
