from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, recommend, restaurants
from routers.restaurant_location import router as location_router

app = FastAPI(
    title="EatWhat?! API",
    description="Mood-based food & restaurant recommendation backend",
    version="1.0.0",
)

# =========================
# CORS（前端 React 一定要）
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Routers（功能模組）
# =========================

# chat.py 本身有 prefix="/chat"
app.include_router(chat.router, tags=["Chat"])

# recommend.py 本身有 prefix="/recommend"
app.include_router(recommend.router, tags=["Recommend"])

# restaurants.py 本身有 prefix="/restaurants"
app.include_router(restaurants.router, tags=["Restaurants"])

# 如果 restaurant_location 有 prefix，就不要再加
app.include_router(location_router)

# =========================
# Health Check
# =========================
@app.get("/")
def home():
    return {"status": "ok", "message": "EatWhat?! Backend is running 🚀"}
