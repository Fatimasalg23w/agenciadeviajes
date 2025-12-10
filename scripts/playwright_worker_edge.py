import sys, time, re, json, os
from playwright.sync_api import sync_playwright, expect

def parse_precio(texto: str) -> int:
    numeros = re.findall(r"\d+", texto.replace(",", "").replace(".", ""))
    return int("".join(numeros)) if numeros else 0

def extraer_vuelos(page):
    rutas = page.locator("div.wizard-step-container.FLIGHT div.route")
    vuelos = []
    for j in range(rutas.count()):
        ruta = rutas.nth(j)
        aerolinea = ruta.locator("img.airline-icon").get_attribute("alt") or ""
        origen = ruta.locator("div.departure-container span.eva-3-p").first.inner_text().strip()
        hora_salida = ruta.locator("div.departure-container span.eva-3-h5").first.inner_text().strip()
        tipo_vuelo = ruta.locator("span.stops-text").inner_text().strip()
        destino = ruta.locator("div.arrival-container span.eva-3-p").first.inner_text().strip()
        hora_llegada = ruta.locator("div.arrival-container span.eva-3-h5").first.inner_text().strip()
        diferencia_dias = ""
        if ruta.locator("span.days-difference").count() > 0:
            diferencia_dias = ruta.locator("span.days-difference").first.inner_text().strip()

        equipajes = []
        items = ruta.locator("div.baggages-container li.luggage-item")
        for k in range(items.count()):
            texto = items.nth(k).inner_text().strip()
            if texto:
                equipajes.append(texto)

        vuelos.append({
            "aerolinea": aerolinea,
            "origen": origen,
            "hora_salida": hora_salida,
            "tipo": tipo_vuelo,
            "destino": destino,
            "hora_llegada": hora_llegada,
            "diferencia_dias": diferencia_dias,
            "equipaje": equipajes
        })
    return vuelos

def run(origen, destino, fecha_ida, fecha_vuelta, tipo, perfil="Default"):
    with sync_playwright() as p:
        # 👉 Proxy desde variable de entorno
        proxy_server = os.environ.get("HTTP_PROXY")
        proxy_config = {"server": proxy_server} if proxy_server else None

        perfil_path = f"/home/KALI/.config/microsoft-edge/{perfil}"
        print(f"Usando perfil de Edge: {perfil_path} con proxy {proxy_server or 'sin proxy'}")

        browser = p.chromium.launch_persistent_context(
            user_data_dir=perfil_path,
            executable_path="/usr/bin/microsoft-edge",
            headless=False,
            proxy=proxy_config
        )
        page = browser.new_page()

        try:
            print("DEBUG: Entrando a la página principal...")
            page.goto("https://www.despegar.com.mx", wait_until="domcontentloaded")

            paquetes_btn = page.locator("#nav-product-PACKAGES")
            expect(paquetes_btn).to_be_visible(timeout=15000)
            paquetes_btn.click()

            # Origen
            origen_input = page.get_by_placeholder("Ingresa desde dónde viajas")
            origen_input.fill(origen)
            page.wait_for_selector("div.ac-container span", timeout=15000)
            page.locator("div.ac-container span", has_text=origen).first.click()

            # Destino
            destino_input = page.get_by_placeholder("Ingresa hacia dónde viajas")
            destino_input.fill(destino)
            page.wait_for_selector("div.ac-container span", timeout=15000)
            page.locator("div.ac-container span", has_text=destino).first.click()

            # Fechas
            page.locator("input[placeholder='Entrada']").click()
            page.wait_for_selector("div.sbox5-monthgrid-datenumber", timeout=30000)

            ida_dia = int(fecha_ida[-2:])
            vuelta_dia = int(fecha_vuelta[-2:])
            page.locator(f"div.sbox5-monthgrid-datenumber[aria-label='{ida_dia}']").first.click()
            time.sleep(1)
            page.locator(f"div.sbox5-monthgrid-datenumber[aria-label='{vuelta_dia}']").first.click()
            time.sleep(1)

            aplicar_btn = page.locator("button.eva-3-btn.-md.-primary")
            if aplicar_btn.count() > 0:
                aplicar_btn.first.click()
            else:
                page.keyboard.press("Enter")

            # Buscar
            buscar_btn = page.locator("button[data-cy='search-btn']").first
            buscar_btn.click()

            # Esperar resultados
            page.wait_for_selector("aloha-app-root div.cluster-container", timeout=60000)
            clusters = page.locator("aloha-app-root div.cluster-container")
            total_clusters = clusters.count()
            print("Clusters encontrados:", total_clusters)

            resultados = []
            vuelos_comunes = extraer_vuelos(page)

            # 👉 Recorrer hasta 8 opciones
            for i in range(min(total_clusters, 8)):
                cluster = clusters.nth(i)
                texto = ""
                if cluster.locator("div[id^='cluster-'] p").count() > 0:
                    texto = cluster.locator("div[id^='cluster-'] p").inner_text()

                nombre = texto.split(".")[0].strip() if texto else "N/A"
                precio_persona = "N/A"
                if "Precio final por persona" in texto:
                    try:
                        precio_persona = texto.split("Precio final por persona")[1].split(".")[0].strip()
                    except:
                        pass

                imagenes = []
                imgs = cluster.locator("img")
                for k in range(min(imgs.count(), 5)):
                    src = imgs.nth(k).get_attribute("src") or ""
                    data_src = imgs.nth(k).get_attribute("data-src") or ""
                    url_img = (src or data_src).strip()
                    if url_img.startswith("http"):
                        imagenes.append(url_img)

                resultados.append({
                    "hotel_name": nombre,
                    "price_per_person": parse_precio(precio_persona),
                    "images": imagenes,
                    "flights": vuelos_comunes,
                })

            # Print final en JSON
            print(json.dumps(resultados, ensure_ascii=False, indent=2))

            # 👉 Espera manual antes de cerrar
            input("\nPresiona ENTER para cerrar el navegador...")

        finally:
            browser.close()

if __name__ == "__main__":
    origen = sys.argv[1]
    destino = sys.argv[2]
    fecha_ida = sys.argv[3]
    fecha_vuelta = sys.argv[4]
    tipo = sys.argv[5]
    perfil = sys.argv[6] if len(sys.argv) > 6 else "Default"
    run(origen, destino, fecha_ida, fecha_vuelta, tipo, perfil)
