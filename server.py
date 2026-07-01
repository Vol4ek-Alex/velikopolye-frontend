import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI()

# Настройка CORS для Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Прописываем ключи Supabase напрямую (для простоты)
# ЗАМЕНИ ЭТИ ЗНАЧЕНИЯ НА СВОИ ИЗ SUPABASE:
SUPABASE_URL = "https://твой-проект.supabase.co"
SUPABASE_KEY = "твой-длинный-api-ключ"

# Инициализируем клиент Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Модель данных для проверки входящих запросов
class Vehicle(BaseModel):
    model: str
    plate: str
    insurance: str
    inspection: str

@app.get("/vehicles")
def get_vehicles():
    """Получение техники из облака Supabase"""
    try:
        # Делаем запрос к таблице 'vehicles'
        response = supabase.table("vehicles").select("*").order("id", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vehicles")
def add_vehicle(vehicle: Vehicle):
    """Сохранение техники в облако Supabase"""
    try:
        data = {
            "model": vehicle.model,
            "plate": vehicle.plate,
            "insurance": vehicle.insurance,
            "inspection": vehicle.inspection
        }
        response = supabase.table("vehicles").insert(data).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
