from fastapi import APIRouter
from core.llm import ask_llm

router = APIRouter(prefix="/chat")


@router.post("/")
def chat_api(data: dict):
    msg = data.get("message", "")
    reply = ask_llm(f"你是 EatWhat?! AI 助理，請以自然語氣回覆：{msg}")
    return {"reply": reply}
