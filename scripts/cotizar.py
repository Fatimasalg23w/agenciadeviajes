import sys, json, time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

# Parámetros desde el backend
origen, destino, fecha_ida, fecha_vuelta, adultos, ninos, tipo = sys.argv[1:8]

# Configuración del navegador
options = Options()
# options.add_argument("--headless=new")  # Desactivado para ver qué hace
options.add_argument("--disable-blink-features=AutomationControlled")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

resultados = []

try:
    print("[DEBUG] Abriendo Despegar...", file=sys.stderr)
    driver.get("https://www.despegar.com.mx/paquetes/")
    time.sleep(5)  # Espera para que cargue la página

    print("[DEBUG] Página cargada. Intentando buscar tarjetas...", file=sys.stderr)

    # Intentamos encontrar tarjetas de resultados
    cards = driver.find_elements(By.XPATH, "//div[contains(@class,'card-title')]")

    if not cards:
        print("[DEBUG] No se encontraron tarjetas. Usando fallback...", file=sys.stderr)
        resultados = [
            {
                "hotel": "Hotel CDMX Fallback",
                "vuelo": "Aeroméxico AM123",
                "precio_total": 25000 if tipo == "vueloHotel" else int((25000 + 5000) * 1.15)
            }
        ]
    else:
        print(f"[DEBUG] Se encontraron {len(cards)} tarjetas", file=sys.stderr)
        for card in cards[:3]:
            try:
                hotel = card.text.strip()
                vuelo = "Vuelo incluido"
                precio_base = 20000
                tour_precio = 5000 if tipo == "tours" else 0
                total_base = precio_base + tour_precio
                total_con_comision = int(total_base * (1.15 if tipo == "tours" else 1.12))

                print(f"[DEBUG] Hotel: {hotel} | Base: {total_base} | Total: {total_con_comision}", file=sys.stderr)

                resultados.append({
                    "hotel": hotel,
                    "vuelo": vuelo,
                    "precio_total": total_con_comision
                })
            except Exception as e:
                print("[ERROR] Fallo al procesar tarjeta:", e, file=sys.stderr)

finally:
    driver.quit()

print(json.dumps(resultados))
