from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI

router = APIRouter(prefix="/chat", tags=["Chat"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatReq(BaseModel):
    message: str

@router.post("/")
def chat(req: ChatReq):
    system_prompt = """
你是一位溫柔、善於傾聽的陪伴者。
請遵守：
1. 先回應使用者的情緒或身體狀況
2. 語氣溫柔，不說教
3. 不要問問題
4. 回覆 1–2 句即可
"""

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message},
            ],
            temperature=0.6,
        )

        reply = resp.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        return {
            "reply": "我在這裡陪你，有點卡住但沒關係 💛"
        }