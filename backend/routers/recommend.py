from fastapi import APIRouter
import json
import random
from core.llm import ask_llm

router = APIRouter(prefix="/recommend")

foods = json.load(open("data/foods.json", "r", encoding="utf-8"))


# =========================
# 工具：整理 LLM 回傳
# =========================
def normalize_names(raw):
    if raw is None:
        return []

    if isinstance(raw, list):
        return [x.strip() for x in raw if isinstance(x, str) and x.strip()]

    if isinstance(raw, dict):
        names = []
        for v in raw.values():
            names.extend(normalize_names(v))
        return names

    if isinstance(raw, str):
        return [x.strip() for x in raw.split("\n") if x.strip()]

    return []


# =========================
# 一般模式：料理介紹（不走情緒）
# =========================
def normal_food_reason(item, taste, temp):
    taste_desc_map = {
        "清爽": [
            "口味清淡、不油膩",
            "調味溫和，吃起來很舒服",
            "不會太重口，接受度高"
        ],
        "重口味": [
            "味道濃郁、有存在感",
            "香氣明顯，吃起來很過癮",
            "口味偏重，滿足感高"
        ],
        "快速": [
            "準備快速，不用等太久",
            "方便省時，隨時都能吃",
            "不太挑時機"
        ]
    }

    temp_desc_map = {
        "熱": [
            "熱熱吃比較有滿足感",
            "溫熱上桌，很適合現在",
            "吃起來比較暖胃"
        ],
        "冷": [
            "冰涼清爽，不會太厚重",
            "涼涼的吃起來很順口",
            "清爽解膩"
        ]
    }

    taste_desc = random.choice(taste_desc_map.get(taste, ["蠻多人喜歡的選擇"]))
    temp_desc = random.choice(temp_desc_map.get(temp, ["吃起來蠻順口的"]))

    return f"{item} {taste_desc}，而且 {temp_desc}。"


# =========================
# 心情模式：真的像 GPT 在推薦
# =========================
def mood_food_reason(item, mood, taste, temp, budget):
    prompt = f"""
使用者目前的狀況或心情：
{mood}

他現在考慮的料理是「{item}」。

請用 2～3 句自然、口語、像朋友在聊天的方式：
1️⃣ 先簡單描述這道料理本身（口感、特色、感覺）
2️⃣ 再說為什麼在「現在這個心情或狀況」下，它會是個不錯的選擇

限制：
- 不要說教
- 不要醫療建議
- 不要提到系統或 AI
- 像真人推薦食物那樣
"""

    resp = ask_llm(prompt)

    if isinstance(resp, dict):
        text = resp.get("reply") or resp.get("answer") or ""
    else:
        text = str(resp)

    text = text.strip()

    if len(text) < 10:
        # fallback（極少）
        return f"{item} 口味相對溫和，現在吃起來不會太有負擔。"

    return text


# =========================
# API
# =========================
@router.post("/")
def recommend_api(data: dict):
    taste = data.get("taste")
    temp = data.get("temp")
    budget = data.get("budget")
    mood = (data.get("mood") or "").strip()

    category_key = f"{taste}_{temp}" if taste and temp else None

    matched = []
    if category_key:
        for group in foods:
            if group.get("category") == category_key:
                matched.extend(group.get("items", []))

    options = []

    # =========================
    # 1️⃣ foods.json 命中
    # =========================
    if matched:
        picked = random.sample(matched, k=min(3, len(matched)))

        for item in picked:
            if mood:
                reason = mood_food_reason(item, mood, taste, temp, budget)
            else:
                reason = normal_food_reason(item, taste, temp)

            options.append({
                "name": item,
                "reason": reason
            })

        return {"options": options}

    # =========================
    # 2️⃣ foods.json 沒命中 → 探索
    # =========================
    style_hint = random.choice([
        "日式料理", "台式家常", "西式料理",
        "清爽料理", "重口味料理", "異國料理"
    ])

    llm_reply = ask_llm(
        f"""
使用者心情或狀況：
{mood if mood else "未特別說明"}

口味：{taste}
溫度：{temp}
預算：{budget}

請推薦 6～10 道彼此風格不同的料理，
偏向【{style_hint}】，
每行一個料理名稱。
"""
    )

    raw = llm_reply.get("reply") if isinstance(llm_reply, dict) else llm_reply
    names = normalize_names(raw)
    random.shuffle(names)

    for name in names[:3]:
        reason = (
            mood_food_reason(name, mood, taste, temp, budget)
            if mood else
            normal_food_reason(name, taste, temp)
        )

        options.append({
            "name": name,
            "reason": reason
        })

    # =========================
    # 3️⃣ 最後保底
    # =========================
    if not options:
        options = [
            {"name": "雞湯", "reason": "清淡溫和，熱熱喝很舒服，通常不太容易出錯。"},
            {"name": "義大利麵", "reason": "選擇多、口味穩定，是安全的選項之一。"},
            {"name": "壽司", "reason": "清爽不油膩，吃起來負擔比較小。"},
        ]

    return {"options": options}
