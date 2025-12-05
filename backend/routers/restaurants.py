from fastapi import APIRouter
import requests
from core.config import GOOGLE_API_KEY

router = APIRouter(prefix="/restaurants")


@router.get("/")
def search_restaurant(keyword: str, location="25.0330,121.5654"):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": location,
        "radius": 2000,
        "keyword": keyword,
        "key": GOOGLE_API_KEY,
    }

    response = requests.get(url, params=params).json()
    return response
