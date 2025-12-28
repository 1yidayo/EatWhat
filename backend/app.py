from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, recommend, restaurants
from routers.restaurant_location import router as location_router



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # 或 ["http://localhost:5173"]
    allow_credentials=True,      # ⭐ 必須加
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(recommend.router)
app.include_router(restaurants.router)
app.include_router(location_router)

@app.get("/")
def home():
    return {"message": "EatWhat?! Backend is running!"}
