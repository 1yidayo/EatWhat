from fastapi import APIRouter
import json
from core.llm import ask_llm

router = APIRouter(prefix="/recommend")

foods = json.load(open("data/foods.json", "r", encoding="utf-8"))


@router.post("/")
def recommend_api(data: dict):
    pref = data.get("preference", "")

    matched = []
    for group in foods:
        if group["category"] in pref:
            matched.extend(group["items"])

    # 如果資料庫沒找到 → 請 LLM 補推薦
    if not matched:
        llm_reply = ask_llm(f"根據偏好：{pref}，請推薦 4 道料理。用換行分隔。")
        items = llm_reply.split("\n")
        return {"items": items}

    return {"items": matched[:4]}
