from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, recommend, restaurants

app = FastAPI()

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(chat.router)
app.include_router(recommend.router)
app.include_router(restaurants.router)

@app.get("/")
def home():
    return {"message": "EatWhat?! Backend is running!"}
