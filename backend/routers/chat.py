from fastapi import APIRouter
from fastapi.responses import JSONResponse
from core.llm import ask_llm
import requests
import os
from urllib.parse import quote

router = APIRouter(prefix="/chat")
GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def fetch_nearby_restaurants(region: str, keyword: str = ""):
    if not GOOGLE_KEY:
        return []

    # 1️⃣ 地區轉經緯度
    geo_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={quote(region)}&key={GOOGLE_KEY}"
    geo_res = requests.get(geo_url).json()
    if not geo_res.get("results"):
        return []
    loc = geo_res["results"][0]["geometry"]["location"]
    lat, lng = loc["lat"], loc["lng"]

    # 2️⃣ 搜附近餐廳（2km 內）
    nearby_url = (
        f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        f"?location={lat},{lng}&radius=2000&type=restaurant&language=zh-TW&key={GOOGLE_KEY}"
    )
    if keyword:
        nearby_url += f"&keyword={quote(keyword)}"

    nearby_res = requests.get(nearby_url).json()
    restaurants = []
    for r in nearby_res.get("results", [])[:5]:  # 每道料理取前5間
        photo_url = None
        if "photos" in r:
            ref = r["photos"][0]["photo_reference"]
            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={ref}&key={GOOGLE_KEY}"
        restaurants.append({
            "name": r.get("name"),
            "rating": r.get("rating"),
            "address": r.get("vicinity"),
            "price_level": r.get("price_level"),
            "photo_url": photo_url
        })
    return restaurants

@router.post("/")
def chat_api(data: dict):
    budget = data.get("budget", "")
    taste = data.get("taste", "")
    temp = data.get("temp", "")
    region = data.get("region", "")
    message = data.get("message", "")

    # 先請 AI 推薦料理（取得名稱、敘述、圖片關鍵字）
    full_prompt = (
        f"請依使用者偏好推薦三道料理，回傳 JSON，包含 name, desc, image_keyword：\n"
        f"預算：{budget}\n"
        f"口味：{taste}\n"
        f"溫度偏好：{temp}\n"
        f"{message}"
    )
    llm_result = ask_llm(full_prompt)
    recommended = llm_result.get("options", [])

    # 對每道料理附加附近餐廳資訊
    options = []
    for food in recommended:
        keyword = food.get("name")
        nearby_restaurants = fetch_nearby_restaurants(region, keyword)
        # 取第一間餐廳做顯示，如果沒有就空
        first_restaurant = nearby_restaurants[0] if nearby_restaurants else {}
        options.append({
            "name": food.get("name"),
            "desc": food.get("desc"),
            "photo_url": first_restaurant.get("photo_url", ""),  # 優先用餐廳照片
            "restaurant_name": first_restaurant.get("name", ""),
            "rating": first_restaurant.get("rating", ""),
            "price_level": first_restaurant.get("price_level", ""),
            "address": first_restaurant.get("address", "")
        })

    return JSONResponse({"options": options}, media_type="application/json")
