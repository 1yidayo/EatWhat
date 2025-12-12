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
        "你是一位美食推薦 AI。請你一次推薦三道料理。\n"
        "務必回覆純 JSON，不要多文字。\n"
        '格式如下：\n'
        '{\n'
        '  "options": [\n'
        '    {"name": "料理1", "image_keyword": "圖", "desc": "說明"},\n'
        '    {"name": "料理2", "image_keyword": "圖", "desc": "說明"},\n'
        '    {"name": "料理3", "image_keyword": "圖", "desc": "說明"}\n'
        '  ]\n'
        '}'
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content

    # 嘗試解析 JSON
    try:
        return json.loads(text)
    except:
        # 最少回傳三個 fallback
        return {
            "options": [
                {"name": "滷肉飯", "image_keyword": "braised pork rice", "desc": text},
                {"name": "牛肉麵", "image_keyword": "beef noodles", "desc": text},
                {"name": "雞腿便當", "image_keyword": "chicken bento", "desc": text},
            ]
        }
