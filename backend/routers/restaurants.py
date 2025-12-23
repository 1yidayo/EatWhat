# backend/routers/restaurants.py

from fastapi import APIRouter
import requests
from urllib.parse import quote
import os

router = APIRouter(prefix="/restaurants")

GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# ★★★ 餐廳特色翻譯表 ★★★
TYPE_MAP = {
    "restaurant": "餐廳",
    "food": "美食",
    "cafe": "咖啡廳",
    "bar": "酒吧",
    "meal_takeaway": "可外帶",
    "meal_delivery": "外送",
    "bakery": "烘焙",
    "supermarket": "超市",
    "convenience_store": "便利商店",
    "fast_food": "速食",
    "hot_pot": "火鍋",
    "bbq": "燒烤",
    "japanese": "日式",
    "korean": "韓式",
    "chinese": "中式",
    "thai": "泰式",
    "pizza": "披薩",
    "ramen": "拉麵",
    "noodle": "麵類",
    "seafood": "海鮮",
    "dessert": "甜點",
}

def translate_types(types):
    translated = []
    for t in types:
        if t in TYPE_MAP:
            translated.append(TYPE_MAP[t])
    return translated if translated else ["一般餐廳"]

@router.get("/")
def search(keyword: str):
    if not GOOGLE_KEY:
        return {"results": [], "error": "Missing GOOGLE_MAPS_API_KEY in .env"}

    query = quote(keyword + " 餐廳")

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

        # ★★★ 翻譯餐廳特色 ★★★
        raw_types = item.get("types", [])
        translated = translate_types(raw_types)

        results.append({
            "name": item.get("name"),
            "rating": item.get("rating"),
            "address": item.get("formatted_address"),
            "price_level": item.get("price_level"),
            "features": translated,  # <--- 餐廳特色（中文）
            "photo_url": photo_url
        })

    return {"results": results}
