from fastapi import APIRouter
import requests
import os
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
            "places.photos"
        )
    }

    body = {
        "textQuery": keyword,
        "languageCode": "zh-TW",
        "maxResultCount": 8,
    }

    # ★ 使用者定位（如果有）
    if lat is not None and lng is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 2000  # 2 公里
            }
        }

    res = requests.post(url, headers=headers, json=body)
    data = res.json()

    results = []

    for place in data.get("places", []):
        photo_url = None
        photos = place.get("photos")
        if photos:
            photo_name = photos[0].get("name")
            if photo_name:
                photo_url = get_photo_url(photo_name)

        results.append({
            "name": place.get("displayName", {}).get("text"),
            "rating": place.get("rating"),
            "address": place.get("formattedAddress"),
            "price_level": place.get("priceLevel"),
            "features": translate_types(place.get("types")),
            "photo_url": photo_url
        })

    return {"results": results}
