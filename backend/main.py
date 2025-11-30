import os
from fastapi import FastAPI, HTTPException, Body
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Cargar .env.local desde la raíz del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env.local")
load_dotenv(dotenv_path=ENV_PATH)

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "project0")

# 👇 Primero se crea la instancia de FastAPI
app = FastAPI()

# Conexión a MongoDB
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# Endpoints
@app.get("/tours")
def get_tours():
    tours = [serialize(t) for t in db.tours.find()]
    return tours

@app.get("/tours/{id}")
def get_tour(id: str):
    tour = db.tours.find_one({"_id": ObjectId(id)})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    return serialize(tour)

@app.post("/tours")
def create_tour(tour: dict = Body(...)):
    result = db.tours.insert_one(tour)
    tour["_id"] = str(result.inserted_id)
    return tour
@app.delete("/tours/{id}")
def delete_tour(id: str):
    result = db.tours.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    return {"message": f"Tour {id} eliminado correctamente"}
