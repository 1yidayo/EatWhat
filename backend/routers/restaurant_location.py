# backend/routers/restaurants.py

from fastapi import APIRouter, Query
import requests
import os
from urllib.parse import quote

router = APIRouter(prefix="/restaurants")

GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


# ================================
# ⭐ 輸入地標 → 推薦 10 間 4 星以上餐廳
# ================================
@router.get("/by_location")
def search_by_location(q: str = Query(..., description="地標或地址")):

    if not GOOGLE_KEY:
        return {"results": [], "error": "GOOGLE_MAPS_API_KEY missing"}

    # 1️⃣ 地址轉經緯度
    geo_url = (
        "https://maps.googleapis.com/maps/api/geocode/json"
        f"?address={quote(q)}&key={GOOGLE_KEY}"
    )
    geo_res = requests.get(geo_url).json()

    if not geo_res["results"]:
        return {"results": []}

    loc = geo_res["results"][0]["geometry"]["location"]
    lat, lng = loc["lat"], loc["lng"]

    # 2️⃣ 搜尋附近餐廳（2 公里）
    nearby_url = (
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        f"?location={lat},{lng}"
        f"&radius=2000&type=restaurant"
        f"&language=zh-TW"
        f"&key={GOOGLE_KEY}"
    )
    nearby_res = requests.get(nearby_url).json()

    raw = nearby_res.get("results", [])

    # 3️⃣ 取 4 星以上
    filtered = [r for r in raw if r.get("rating", 0) >= 4.0]

    # 4️⃣ 亂數排序再取 10 間
    import random
    random.shuffle(filtered)

    restaurants = []
    for item in filtered[:10]:
        photo_url = None
        if "photos" in item:
            ref = item["photos"][0]["photo_reference"]
            photo_url = (
                "https://maps.googleapis.com/maps/api/place/photo"
                f"?maxwidth=400&photo_reference={ref}&key={GOOGLE_KEY}"
            )

        restaurants.append({
            "name": item.get("name"),
            "rating": item.get("rating"),
            "address": item.get("vicinity"),
            "photo_url": photo_url,
            "price_level": item.get("price_level"),
        })

    return {"results": restaurants}
