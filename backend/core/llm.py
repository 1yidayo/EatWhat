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
    "你是一位美食推薦 AI，負責根據『預算 → 口味 → 冷熱』的優先順序推薦三道料理。\n"
    "請務必嚴格遵守以下規則：\n"
    "\n"
    "==============================\n"
    "【價格規則（最高優先級，絕對禁止違反）】\n"
    "==============================\n"
    "1. 若預算為「100 以下」，只能推薦 *街邊小吃等極低價料理*。\n"
    "   ✔ 可推薦：滷肉飯、雞肉飯、水餃、陽春麵、蛋餅、飯糰、蔥抓餅、鐵板麵、炒麵、炒飯、小籠包（小份）、豆花、麵線、碗粿、肉圓等。\n"
    "   ❌ 絕對禁止（不能出現在任何名稱或描述）：\n"
    "      拉麵、火鍋、丼飯、韓式料理、義大利麵、咖哩飯、排骨飯、牛肉麵、壽司套餐、生魚片、燒肉、炸豬排、漢堡套餐等中高價位料理。\n"
    "   ➤ 只要價格為「100 以下」，就算口味或冷熱允許，也 *不能* 推薦上述中高價位食品。\n"
    "\n"
    "2. 若預算為「150」，可推薦低價到中價，但 *不得出現明顯高價*（例如火鍋、韓式餐、義大利麵、壽司套餐）。\n"
    "\n"
    "3. 若預算為「200」或「不在意」，價格不限制。\n"
    "\n"
    "==============================\n"
    "【口味規則】\n"
    "==============================\n"
    "4. 若使用者選『清爽』：只能推薦清淡、不油膩料理。\n"
    "   禁止出現：炸、酥、重鹹、濃湯、奶油、濃郁等字樣。\n"
    "\n"
    "5. 若使用者選『重口味』：只能推薦濃郁、辛辣、重鹹或香料類食物。\n"
    "   禁止清淡料理：清粥、小菜、雞絲飯、白斬雞、沙拉等。\n"
    "\n"
    "==============================\n"
    "【冷熱規則】\n"
    "==============================\n"
    "6. 若溫度選『熱』：禁止出現冷食、壽司、生魚片、沙拉、涼拌。\n"
    "7. 若溫度選『冷』：禁止出現湯、鍋、炒、燙、烤、炸、燉等熱食字眼。\n"
    "\n"
    "==============================\n"
    "【輸出規則】\n"
    "==============================\n"
    "8. 必須回傳『剛好三道料理』，每道包含：name、image_keyword、desc。\n"
    "9. 回覆只能是『純 JSON』，不能包含其他內容。\n"
    "\n"
    "==============================\n"
    "【JSON 格式】\n"
    "==============================\n"
    "{\n"
    '  "options": [\n'
    '    {"name": "料理名稱", "image_keyword": "圖片關鍵字", "desc": "原因"},\n'
    '    {"name": "料理名稱", "image_keyword": "圖片關鍵字", "desc": "原因"},\n'
    '    {"name": "料理名稱", "image_keyword": "圖片關鍵字", "desc": "原因"}\n'
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
