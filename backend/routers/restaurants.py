# backend/routers/restaurants.py

from fastapi import APIRouter
import requests
from urllib.parse import quote
import os

router = APIRouter(prefix="/restaurants")

GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

@router.get("/")
def search(keyword: str):
    if not GOOGLE_KEY:
        return {"results": [], "error": "Missing GOOGLE_MAPS_API_KEY in .env"}

    query = quote(keyword + " 餐廳")

    # 伺服器端打 Google API（不會被 CORB 阻擋）
    url = (
        "https://maps.googleapis.com/maps/api/place/textsearch/json"
        f"?query={query}&language=zh-TW&key={GOOGLE_KEY}"
    )

    google_res = requests.get(url).json()

    results = []
    for item in google_res.get("results", []):
        photo_url = None
        if "photos" in item:
            ref = item["photos"][0]["photo_reference"]
            photo_url = (
                "https://maps.googleapis.com/maps/api/place/photo"
                f"?maxwidth=400&photo_reference={ref}&key={GOOGLE_KEY}"
            )

        results.append({
            "name": item.get("name"),
            "rating": item.get("rating"),
            "vicinity": item.get("vicinity"),
            "address": item.get("formatted_address"),
            "photo_url": photo_url
        })

    return {"results": results}