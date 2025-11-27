from pymongo import MongoClient

# Conexión a Atlas (igual que en main.py)
client = MongoClient("mongodb+srv://fatima2345612_db_user:KCrfjhnefQrOpXuw@cluster0.whutp0a.mongodb.net/?appName=Cluster0")
db = client["explore_mexico"]
tours = db["tours"]

# Tours de ejemplo con fechas
sample_tours = [
    {
        "nombre": "Ciudad de México",
        "destino": "CDMX",
        "descripcion": "Explora la vibrante capital mexicana con visitas a museos, plazas y gastronomía única.",
        "precio": 5600,
        "imagen": "https://via.placeholder.com/400x250?text=CDMX",
        "fecha_inicio": "15/12/2025",
        "fecha_fin": "20/12/2025"
    },
    {
        "nombre": "Cancún",
        "destino": "Quintana Roo",
        "descripcion": "Playas paradisíacas, vida nocturna y excursiones a ruinas mayas.",
        "precio": 7200,
        "imagen": "https://via.placeholder.com/400x250?text=Cancun",
        "fecha_inicio": "05/01/2026",
        "fecha_fin": "12/01/2026"
    },
    {
        "nombre": "Oaxaca",
        "destino": "Oaxaca",
        "descripcion": "Descubre la riqueza cultural, artesanal y gastronómica de Oaxaca.",
        "precio": 4800,
        "imagen": "https://via.placeholder.com/400x250?text=Oaxaca",
        "fecha_inicio": "10/02/2026",
        "fecha_fin": "15/02/2026"
    }
]

# Limpia la colección y agrega los tours
tours.delete_many({})
tours.insert_many(sample_tours)

print("✅ Seed completado: tours insertados en Atlas")
