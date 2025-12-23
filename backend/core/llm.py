from openai import OpenAI
from core.config import OPENAI_API_KEY
import json

client = OpenAI(api_key=OPENAI_API_KEY)

def ask_llm(prompt: str) -> dict:
    """
    回傳格式：
    {
        "options": [
            {"name": "...", "image_keyword": "...", "desc": "..."},
            {"name": "...", "image_keyword": "...", "desc": "..."},
            {"name": "...", "image_keyword": "...", "desc": "..."}
        ]
    }
    """

    system_msg = (
    "你是一位美食推薦 AI，必須根據使用者提供的條件（預算、口味、溫度）推薦料理。\n"
    "請嚴格遵守以下規則：\n"
    "\n"
    "【溫度規則（最重要）】\n"
    "1. 若溫度偏好是「熱」，只能推薦熱食。\n"
    "   禁止出現任何冷食相關字樣，例如：涼、冰、冷、沙拉、生魚片、壽司、涼拌。\n"
    "2. 若溫度偏好是「冷」，只能推薦冷食。\n"
    "   禁止出現代表熱食的字，例如：熱、湯、鍋、炒、烤、炸、燉。\n"
    "\n"
    "【推薦內容規則】\n"
    "3. 一次必須推薦『剛好三道』料理。\n"
    "4. 每道料理需包含：料理名稱、搜尋圖片用關鍵字、簡短描述原因。\n"
    "5. 不得推薦與條件矛盾的料理，例如：使用者選冷 → 不能出現湯麵 / 火鍋。\n"
    "\n"
    "【格式規則】\n"
    "6. 回覆必須是『純 JSON』，不得包含任何多餘文字、說明或註解。\n"
    "7. JSON 結構如下：\n"
    "{\n"
    '  "options": [\n'
    '    {"name": "料理名稱", "image_keyword": "圖片搜尋用關鍵字", "desc": "原因描述"},\n'
    '    {"name": "料理名稱", "image_keyword": "圖片搜尋用關鍵字", "desc": "原因描述"},\n'
    '    {"name": "料理名稱", "image_keyword": "圖片搜尋用關鍵字", "desc": "原因描述"}\n'
    "  ]\n"
    "}"
)


    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()

    # 嘗試解析 JSON
    try:
        parsed = json.loads(text)

        # 若 AI 回傳不是三個，補齊避免出錯
        if "options" not in parsed or len(parsed["options"]) != 3:
            raise ValueError("Invalid JSON length")

        return parsed

    except:
        # fallback（三道固定）
        return {
            "options": [
                {"name": "滷肉飯", "image_keyword": "braised pork rice", "desc": "fallback"},
                {"name": "牛肉麵", "image_keyword": "beef noodles", "desc": "fallback"},
                {"name": "雞腿便當", "image_keyword": "chicken bento", "desc": "fallback"},
            ]
        }
