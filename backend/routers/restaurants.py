from fastapi import APIRouter
import requests
import os
import math
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/restaurants")

GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

TYPE_MAP = {
    "restaurant": "餐廳",
    "food": "美食",
    "cafe": "咖啡廳",
    "bar": "酒吧",
    "meal_takeaway": "可外帶",
    "meal_delivery": "外送",
    "bakery": "烘焙",
    "fast_food": "速食",
    "hot_pot": "火鍋",
    "bbq": "燒烤",
    "japanese": "日式",
    "korean": "韓式",
    "chinese": "中式",
    "thai": "泰式",
    "ramen": "拉麵",
    "noodle": "麵類",
    "dessert": "甜點",
}

# ⭐ 新增：價格等級轉換（關鍵）
PRICE_MAP = {
    "PRICE_LEVEL_FREE": 0,
    "PRICE_LEVEL_INEXPENSIVE": 1,
    "PRICE_LEVEL_MODERATE": 2,
    "PRICE_LEVEL_EXPENSIVE": 3,
    "PRICE_LEVEL_VERY_EXPENSIVE": 4,
}

def translate_types(types):
    translated = []
    for t in types or []:
        if t in TYPE_MAP:
            translated.append(TYPE_MAP[t])
    return translated if translated else ["一般餐廳"]

def get_photo_url(photo_name: str, max_width: int = 400):
    return (
        f"https://places.googleapis.com/v1/{photo_name}/media"
        f"?maxWidthPx={max_width}&key={GOOGLE_KEY}"
    )

# ⭐ 距離計算（公尺）
def calc_distance(lat1, lng1, lat2, lng2):
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return int(R * c)

@router.get("/")
def search(keyword: str, lat: float | None = None, lng: float | None = None):

    if not GOOGLE_KEY:
        return {"results": [], "error": "Missing GOOGLE_MAPS_API_KEY"}

    url = "https://places.googleapis.com/v1/places:searchText"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_KEY,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.formattedAddress,"
            "places.rating,"
            "places.priceLevel,"
            "places.types,"
            "places.photos,"
            "places.location"
        )
    }

    body = {
        "textQuery": keyword,
        "languageCode": "zh-TW",
        "maxResultCount": 8,
    }

    # 使用者定位
    if lat is not None and lng is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 2000
            }
        }

    res = requests.post(url, headers=headers, json=body)
    data = res.json()

    results = []

    for place in data.get("places", []):
        # 照片
        photo_url = None
        photos = place.get("photos")
        if photos:
            name = photos[0].get("name")
            if name:
                photo_url = get_photo_url(name)

        # 距離
        distance = None
        loc = place.get("location")
        if lat is not None and lng is not None and loc:
            distance = calc_distance(
                lat, lng,
                loc["latitude"], loc["longitude"]
            )

        # ⭐ 價格轉數字（關鍵）
        raw_price = place.get("priceLevel")
        price_level = PRICE_MAP.get(raw_price)

        results.append({
            "name": place.get("displayName", {}).get("text"),
            "rating": place.get("rating"),
            "address": place.get("formattedAddress"),
            "price_level": price_level,   # ✅ 現在是 0–4
            "features": translate_types(place.get("types")),
            "photo_url": photo_url,
            "distance": distance
        })

    return {"results": results}
