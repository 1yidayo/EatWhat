const BASE = "http://127.0.0.1:8000";

export async function chat(message) {
  const res = await fetch(BASE + "/chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return res.json();
}

export async function recommendAPI(preference) {
  const res = await fetch(BASE + "/recommend/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preference })
  });
  return res.json();
}

export async function searchRestaurants(keyword) {
  const res = await fetch(BASE + `/restaurants/?keyword=${keyword}`);
  return res.json();
}
