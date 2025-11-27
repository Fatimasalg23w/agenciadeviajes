from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from bson import ObjectId

app = FastAPI()

# Conexión a Atlas (usa exactamente el string que te da Atlas)
client = MongoClient("mongodb+srv://fatima2345612_db_user:KCrfjhnefQrOpXuw@cluster0.whutp0a.mongodb.net/?appName=Cluster0")
db = client["explore_mexico"]

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

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
