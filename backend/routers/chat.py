from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI

router = APIRouter(prefix="/chat", tags=["Chat"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatReq(BaseModel):
    message: str

@router.post("/")
def chat_api(data: dict):
    budget = data.get("budget", "")
    taste = data.get("taste", "")
    temp = data.get("temp", "")
    region = data.get("region", "")
    message = data.get("message", "")

    # AI 推薦料理（只負責料理）
    full_prompt = (
        f"請依使用者偏好推薦三道料理，回傳 JSON，包含 name, desc：\n"
        f"預算：{budget}\n"
        f"口味：{taste}\n"
        f"溫度偏好：{temp}\n"
        f"{message}"
    )

    llm_result = ask_llm(full_prompt)
    recommended = llm_result.get("options", [])

    options = []

    for food in recommended:
        food_name = food.get("name")

        # 🔥 用料理名找附近餐廳
        restaurants = fetch_nearby_restaurants(region, food_name)

        first = restaurants[0] if restaurants else {}

        options.append({
            "name": food_name,
            "desc": food.get("desc"),

            # ⭐ 關鍵：圖片來自餐廳
            "photo_url": first.get("photo_url", ""),

            # 以下資訊「只在點進單一卡時用」
            "restaurant_name": first.get("name", ""),
            "rating": first.get("rating", ""),
            "price_level": first.get("price_level", ""),
            "address": first.get("address", ""),
        })

    return JSONResponse({"options": options})


