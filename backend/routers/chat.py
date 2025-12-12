from fastapi import APIRouter
from fastapi.responses import JSONResponse
from core.llm import ask_llm

router = APIRouter(prefix="/chat")

@router.post("/")
def chat_api(data: dict):
    budget = data.get("budget", "")
    taste = data.get("taste", "")
    temp = data.get("temp", "")
    message = data.get("message", "")

    full_prompt = (
        f"預算：{budget}\n"
        f"口味：{taste}\n"
        f"溫度偏好：{temp}\n"
        f"{message}"
    )

    result = ask_llm(full_prompt)

    return JSONResponse(content=result, media_type="application/json")
