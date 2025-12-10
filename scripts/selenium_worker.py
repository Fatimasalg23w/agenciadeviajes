import sys, json, time, re, random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import random, os

# Lista de proxies mexicanos (los que sacaste de Proxynova)
PROXIES = [
    "http://187.217.194.178:8080",
    "http://186.96.50.113:8080",
    "http://201.159.99.37:8080",
    "http://189.201.153.90:8080",
    "http://45.231.220.79:8080"
]

def get_random_proxy():
    return random.choice(PROXIES)


def calcular_precio_con_comision(tipo: str, precio_base: int) -> int:
    comision = 1.15 if tipo == "tours" else 1.12
    return int(precio_base * comision)

def parse_precio(texto: str) -> int:
    numeros = re.findall(r"\d+", texto.replace(",", "").replace(".", ""))
    return int("".join(numeros)) if numeros else 0

def seleccionar_fecha(driver, fecha_ida, fecha_vuelta):
    # Abrir calendario
    entrada_input = driver.find_element(By.XPATH, "//input[@placeholder='Entrada']")
    entrada_input.click()
    time.sleep(2)

    meses = {
        "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
        "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
        "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
    }

    año_ida, mes_ida, dia_ida = fecha_ida.split("-")
    año_vuelta, mes_vuelta, dia_vuelta = fecha_vuelta.split("-")

    # Seleccionar día ida
    dia_entrada = driver.find_element(By.CSS_SELECTOR, f"div.sbox5-monthgrid-datenumber[aria-label='{dia_ida}']")
    dia_entrada.click()
    time.sleep(1)

    # Seleccionar día vuelta
    dia_salida = driver.find_element(By.CSS_SELECTOR, f"div.sbox5-monthgrid-datenumber[aria-label='{dia_vuelta}']")
    dia_salida.click()
    time.sleep(1)

    aplicar_btn = driver.find_element(By.XPATH, "//em[contains(text(),'Aplicar')]")
    aplicar_btn.click()
    time.sleep(2)

def buscar_paquetes(driver, origen, destino, fecha_ida, fecha_vuelta):
    # Recargar la página principal 2 veces como en Playwright
    for _ in range(2):
        driver.get("https://www.despegar.com.mx")
        time.sleep(random.uniform(2, 4))

    paquetes_btn = driver.find_element(By.LINK_TEXT, "Paquetes")
    paquetes_btn.click()
    time.sleep(2)

    origen_input = driver.find_element(By.XPATH, "//input[@placeholder='Ingresa desde dónde viajas']")
    origen_input.clear()
    origen_input.send_keys(origen)
    time.sleep(2)
    origen_input.send_keys(Keys.ARROW_DOWN)
    origen_input.send_keys(Keys.ENTER)

    destino_input = driver.find_element(By.XPATH, "//input[@placeholder='Ingresa hacia dónde viajas']")
    destino_input.clear()
    destino_input.send_keys(destino)
    time.sleep(2)
    destino_input.send_keys(Keys.ARROW_DOWN)
    destino_input.send_keys(Keys.ENTER)

    seleccionar_fecha(driver, fecha_ida, fecha_vuelta)

    buscar_btn = driver.find_element(By.CSS_SELECTOR, "button[data-cy='search-btn']")
    buscar_btn.click()
    time.sleep(10)

def extraer_resultados(driver, tipo):
    clusters = driver.find_elements(By.CSS_SELECTOR, "div.cluster-container")
    resultados = []

    for cluster in clusters[:3]:
        try:
            texto = cluster.text
            hotel = texto.split(".")[0].strip()

            precio_element = cluster.find_element(By.CSS_SELECTOR, "span.main-value")
            precio_texto = precio_element.text.strip()
            precio = parse_precio(precio_texto)

            estrellas_match = re.search(r"(\d+)\s+estrellas", texto, flags=re.IGNORECASE)
            puntuacion_match = re.search(r"puntuación\s+de\s+([0-9.]+)", texto, flags=re.IGNORECASE)

            resultados.append({
                "hotel": hotel,
                "precio_total": calcular_precio_con_comision(tipo, precio),
                "estrellas": estrellas_match.group(1) if estrellas_match else None,
                "puntuacion": puntuacion_match.group(1) if puntuacion_match else None
            })
        except Exception:
            continue

    return resultados

def run(origen, destino, fecha_ida, fecha_vuelta, tipo):
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        buscar_paquetes(driver, origen, destino, fecha_ida, fecha_vuelta)
        resultados = extraer_resultados(driver, tipo)
        return resultados
    finally:
        driver.quit()

if __name__ == "__main__":
    origen, destino, fecha_ida, fecha_vuelta, tipo = sys.argv[1:6]
    resultados = run(origen, destino, fecha_ida, fecha_vuelta, tipo)
    print(json.dumps(resultados, ensure_ascii=False))
