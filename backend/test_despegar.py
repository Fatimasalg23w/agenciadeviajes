from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configuración del navegador
options = Options()
options.add_argument("--start-maximized")
# Si quieres que no abra ventana gráfica (modo servidor), descomenta:
# options.add_argument("--headless=new")

# Inicializar driver con webdriver-manager
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    # Abrir Despegar
    driver.get("https://www.despegar.com.mx/paquetes/")
    print("Título de la página:", driver.title)

    # Aceptar cookies si aparece el botón
    try:
        aceptar_btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Aceptar')]"))
        )
        aceptar_btn.click()
        print("Cookies aceptadas")
    except:
        print("No apareció el banner de cookies")

    # Pausa para que veas la página abierta
    input("Presiona Enter para cerrar el navegador...")

finally:
    driver.quit()
