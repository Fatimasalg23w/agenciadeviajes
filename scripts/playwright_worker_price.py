import sys, time, re, json, os
from datetime import datetime
from playwright.sync_api import sync_playwright, expect

def parse_precio(texto: str) -> int:
    """Extrae números de un texto de precio y lo convierte a entero"""
    numeros = re.findall(r"\d+", texto.replace(",", "").replace(".", "").replace("$", "").replace("MXN", "").strip())
    return int("".join(numeros)) if numeros else 0

def extraer_vuelo_recomendado(page):
    """Extrae información del vuelo recomendado (ida y regreso)"""
    vuelos = {"ida": {}, "regreso": {}}

    time.sleep(30)   # ⏳ Espera fija de 30 segundos
    
    try:
        print("\nDEBUG: Extrayendo información de vuelos...")
        
        vuelo_container = page.locator("div.c-box-air")
        
        if vuelo_container.count() == 0:
            print("ADVERTENCIA: No se encontró contenedor de vuelos")
            return vuelos
        
        # VUELO DE IDA
        ida_container = page.locator("div.c-block-01").first
        if ida_container.count() > 0:
            try:
                aerolinea_img = ida_container.locator("img").first
                if aerolinea_img.count() > 0:
                    vuelos["ida"]["aerolinea"] = aerolinea_img.get_attribute("alt") or "N/A"
                
                origen = ida_container.locator("div.font-12.text-center.lh-1").first
                if origen.count() > 0:
                    vuelos["ida"]["origen"] = origen.inner_text().strip()
                
                hora_salida = ida_container.locator("div.font-14.text-center.fw-bold").first
                if hora_salida.count() > 0:
                    vuelos["ida"]["hora_salida"] = hora_salida.inner_text().strip()
                
                escalas = ida_container.locator("a.a-link-primary.fw-semibold")
                if escalas.count() > 0:
                    vuelos["ida"]["tipo"] = escalas.inner_text().strip()
                
                destino = ida_container.locator("div.font-12.text-center.lh-1").last
                if destino.count() > 0:
                    vuelos["ida"]["destino"] = destino.inner_text().strip()
                
                hora_llegada = ida_container.locator("div.font-14.text-center.fw-bold").last
                if hora_llegada.count() > 0:
                    vuelos["ida"]["hora_llegada"] = hora_llegada.inner_text().strip()
                
                print(f"DEBUG: Vuelo IDA - {vuelos['ida'].get('origen', 'N/A')} -> {vuelos['ida'].get('destino', 'N/A')}")
            except Exception as e:
                print(f"Error extrayendo vuelo de ida: {e}")
        
        # VUELO DE REGRESO
        regreso_container = page.locator("div.c-block-01").nth(1)
        if regreso_container.count() > 0:
            try:
                aerolinea_img = regreso_container.locator("img").first
                if aerolinea_img.count() > 0:
                    vuelos["regreso"]["aerolinea"] = aerolinea_img.get_attribute("alt") or "N/A"
                
                origen = regreso_container.locator("div.font-12.text-center.lh-1").first
                if origen.count() > 0:
                    vuelos["regreso"]["origen"] = origen.inner_text().strip()
                
                hora_salida = regreso_container.locator("div.font-14.text-center.fw-bold").first
                if hora_salida.count() > 0:
                    vuelos["regreso"]["hora_salida"] = hora_salida.inner_text().strip()
                
                escalas = regreso_container.locator("a.a-link-primary.fw-semibold")
                if escalas.count() > 0:
                    vuelos["regreso"]["tipo"] = escalas.inner_text().strip()
                
                destino = regreso_container.locator("div.font-12.text-center.lh-1").last
                if destino.count() > 0:
                    vuelos["regreso"]["destino"] = destino.inner_text().strip()
                
                hora_llegada = regreso_container.locator("div.font-14.text-center.fw-bold").last
                if hora_llegada.count() > 0:
                    vuelos["regreso"]["hora_llegada"] = hora_llegada.inner_text().strip()
                
                print(f"DEBUG: Vuelo REGRESO - {vuelos['regreso'].get('origen', 'N/A')} -> {vuelos['regreso'].get('destino', 'N/A')}")
            except Exception as e:
                print(f"Error extrayendo vuelo de regreso: {e}")
    
    except Exception as e:
        print(f"Error general extrayendo vuelos: {e}")
    
    return vuelos

def extraer_paquetes(page):
    """Extrae las primeras 10 opciones de paquetes"""
    resultados = []
    
    try:
        print("\nDEBUG: Extrayendo paquetes...")
        
        page.wait_for_selector("div.pth-card", timeout=30000)
        time.sleep(2)
        
        paquetes = page.locator("div.pth-card")
        total = paquetes.count()
        print(f"DEBUG: Total de paquetes encontrados: {total}")
        
        for i in range(min(total, 10)):
            try:
                paquete = paquetes.nth(i)
                
                nombre = "N/A"
                nombre_selector = paquete.locator("p.card-title.h6")
                if nombre_selector.count() > 0:
                    nombre = nombre_selector.inner_text().strip()
                
                ciudad = "N/A"
                ciudad_selector = paquete.locator("p.card-subtittle")
                if ciudad_selector.count() > 0:
                    ciudad = ciudad_selector.inner_text().strip()
                
                estrellas = "N/A"
                estrellas_selector = paquete.locator("div.stars-div i")
                if estrellas_selector.count() > 0:
                    clase_estrellas = estrellas_selector.first.get_attribute("class") or ""
                    if "icons-star-" in clase_estrellas:
                        estrellas = clase_estrellas.split("icons-star-")[-1]
                
                calificacion = "N/A"
                rating_selector = paquete.locator("div.btn.rating-tag").first
                if rating_selector.count() > 0:
                    calificacion = rating_selector.inner_text().strip()
                
                opiniones = "N/A"
                opiniones_selector = paquete.locator("p.card-text.total-surveys").first
                if opiniones_selector.count() > 0:
                    opiniones = opiniones_selector.inner_text().strip()
                
                plan_alimentos = "Sin alimentos"
                plan_selector = paquete.locator("div.card-mealplan")
                if plan_selector.count() > 0:
                    plan_alimentos = plan_selector.inner_text().strip()
                
                precio_original = None
                precio_original_selector = paquete.locator("del div.currency-display")
                if precio_original_selector.count() > 0:
                    precio_original_texto = precio_original_selector.inner_text().strip()
                    precio_original = parse_precio(precio_original_texto)
                
                precio_persona = "N/A"
                precio_selector = paquete.locator("span.hotel-heading-price-current div.currency-display")
                if precio_selector.count() > 0:
                    precio_texto = precio_selector.inner_text().strip()
                    precio_persona = parse_precio(precio_texto)
                
                precio_total = "N/A"
                total_selector = paquete.locator("p.card-taxes span div.currency-display")
                if total_selector.count() > 0:
                    precio_total_texto = total_selector.inner_text().strip()
                    precio_total = parse_precio(precio_total_texto)
                
                descuento = None
                descuento_selector = paquete.locator("div.DiscountTag")
                if descuento_selector.count() > 0:
                    descuento = descuento_selector.inner_text().strip()
                
                imagen = ""
                img_selector = paquete.locator("img.card-img-top.hotel-image")
                if img_selector.count() > 0:
                    imagen = img_selector.get_attribute("src") or ""
                
                url = ""
                link_selector = paquete.locator("a[href*='hotel-detalle']").first
                if link_selector.count() > 0:
                    url = link_selector.get_attribute("href") or ""
                
                paquete_data = {
                    "hotel_name": nombre,
                    "ciudad": ciudad,
                    "estrellas": estrellas,
                    "calificacion": calificacion,
                    "opiniones": opiniones,
                    "plan_alimentos": plan_alimentos,
                    "precio_original": precio_original,
                    "precio_persona": precio_persona,
                    "precio_total": precio_total,
                    "descuento": descuento,
                    "imagen": imagen,
                    "url": url
                }
                
                resultados.append(paquete_data)
                print(f"DEBUG: Paquete {i+1}/10 - {nombre} - ${precio_persona:,} MXN")
                
            except Exception as e:
                print(f"Error procesando paquete {i+1}: {e}")
                continue
    
    except Exception as e:
        print(f"Error extrayendo paquetes: {e}")
    
    return resultados

def seleccionar_fecha_easepick(page, fecha_objetivo, es_fecha_vuelta=False):
    """Selecciona una fecha en el calendario easepick de PriceTravel usando data-time"""
    try:
        fecha_obj = datetime.strptime(fecha_objetivo, "%Y-%m-%d")
        timestamp_objetivo = int(fecha_obj.timestamp() * 1000)  # Convertir a milisegundos
        
        mes_objetivo = fecha_obj.month
        año_objetivo = fecha_obj.year
        dia_objetivo = fecha_obj.day
        
        meses_es = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
        
        print(f"\nDEBUG: {'VUELTA' if es_fecha_vuelta else 'IDA'} - Buscando {dia_objetivo} de {meses_es[mes_objetivo-1]} {año_objetivo}")
        print(f"DEBUG: Timestamp objetivo: {timestamp_objetivo}")
        
        max_intentos = 24
        intentos = 0
        
        while intentos < max_intentos:
            # Buscar AMBOS meses visibles en el calendario
            month_headers = page.locator(".month-name span")
            
            if month_headers.count() >= 1:
                # El calendario muestra 2 meses a la vez
                meses_visibles = []
                años_visibles = []
                
                for i in range(min(2, month_headers.count())):
                    mes_text = month_headers.nth(i).inner_text().strip()
                    # Extraer mes y año del texto "diciembre 2025" o "enero 2026"
                    partes = mes_text.lower().split()
                    if len(partes) >= 2:
                        nombre_mes = partes[0]
                        año = int(partes[1])
                        meses_visibles.append(nombre_mes)
                        años_visibles.append(año)
                    else:
                        meses_visibles.append(partes[0] if partes else "")
                        años_visibles.append(None)
                
                print(f"DEBUG: Meses visibles: {list(zip(meses_visibles, años_visibles))}")
                
                # Verificar si nuestro mes Y AÑO objetivo están visibles
                mes_objetivo_nombre = meses_es[mes_objetivo - 1]
                mes_encontrado = False
                indice_calendario = -1
                
                for i, (mes_visible, año_visible) in enumerate(zip(meses_visibles, años_visibles)):
                    # Comparar MES Y AÑO
                    if mes_objetivo_nombre in mes_visible and (año_visible is None or año_visible == año_objetivo):
                        mes_encontrado = True
                        indice_calendario = i
                        print(f"DEBUG: ✓ Mes y año objetivo '{mes_objetivo_nombre} {año_objetivo}' encontrado en calendario {i+1}")
                        break
                
                if mes_encontrado:
                    # Ahora buscar el día específico usando data-time
                    time.sleep(0.8)
                    
                    # Buscar en el calendario correcto (primero o segundo)
                    calendars = page.locator(".calendar")
                    if calendars.count() > indice_calendario:
                        calendario_correcto = calendars.nth(indice_calendario)
                        dias = calendario_correcto.locator(".day.unit:not(.not-available)")
                        print(f"DEBUG: {dias.count()} días disponibles en calendario {indice_calendario + 1}")
                        
                        # Buscar el día por timestamp
                        dia_encontrado = False
                        
                        for i in range(dias.count()):
                            dia = dias.nth(i)
                            data_time = dia.get_attribute("data-time")
                            texto_dia = dia.inner_text().strip()
                            
                            if data_time:
                                dia_timestamp = int(data_time)
                                # Comparar timestamps con margen de 12 horas (43200000 ms)
                                diferencia = abs(dia_timestamp - timestamp_objetivo)
                                
                                if diferencia < 43200000:  # Menos de 12 horas de diferencia
                                    print(f"DEBUG: ✓ Día encontrado: {texto_dia} (timestamp: {data_time})")
                                    print(f"DEBUG: Diferencia de timestamp: {diferencia}ms")
                                    dia.click()
                                    time.sleep(1.5)
                                    dia_encontrado = True
                                    return True
                        
                        if not dia_encontrado:
                            print(f"ADVERTENCIA: Día {dia_objetivo} no encontrado en el calendario correcto")
                    else:
                        print(f"ERROR: No se pudo acceder al calendario {indice_calendario + 1}")
                else:
                    print(f"DEBUG: Mes '{mes_objetivo_nombre} {año_objetivo}' no visible aún, avanzando...")
                
                # Avanzar al siguiente mes
                next_button = page.locator("button.next-button.unit").last
                if next_button.count() > 0:
                    print(f"DEBUG: Click en botón 'siguiente mes' (intento {intentos + 1})")
                    next_button.click()
                    time.sleep(1.2)  # Esperar a que se cargue el siguiente mes
                else:
                    print("ERROR: No se encontró botón 'siguiente mes'")
                    return False
            else:
                print("ERROR: No se encontró header del calendario")
                return False
            
            intentos += 1
        
        print(f"ERROR: No se pudo seleccionar fecha después de {max_intentos} intentos")
        return False
        
    except Exception as e:
        print(f"ERROR en seleccionar_fecha_easepick: {e}")
        import traceback
        traceback.print_exc()
        return False

def run(origen, destino, fecha_ida, fecha_vuelta, tipo, perfil="Default"):
    with sync_playwright() as p:
        proxy_server = os.environ.get("HTTP_PROXY")
        proxy_config = {"server": proxy_server} if proxy_server else None

        perfil_path = f"/home/KALI/.config/microsoft-edge/{perfil}"
        print(f"Usando perfil de Edge: {perfil_path}")
        if proxy_server:
            print(f"Con proxy: {proxy_server}")

        browser = p.chromium.launch_persistent_context(
            user_data_dir=perfil_path,
            executable_path="/usr/bin/microsoft-edge",
            headless=False,
            proxy=proxy_config,
            viewport={"width": 1920, "height": 1080}
        )
        
        page = browser.new_page()

        try:
            print("=" * 60)
            print("DEBUG: Iniciando búsqueda en PriceTravel")
            print("=" * 60)
            
            print("DEBUG: Cargando página de paquetes...")
            page.goto("https://www.pricetravel.com/es/paquetes", wait_until="domcontentloaded")
            time.sleep(3)

            # === ORIGEN ===
            print(f"\nDEBUG: === CONFIGURANDO ORIGEN: {origen} ===")
            origen_input = page.locator("input#place_name_package")
            expect(origen_input).to_be_visible(timeout=10000)
            
            origen_input.click()
            time.sleep(0.5)
            origen_input.fill("")
            time.sleep(0.3)
            origen_input.type(origen, delay=150)
            
            print("DEBUG: Esperando sugerencias de origen...")
            page.wait_for_selector("button.list-group-item-action:visible", timeout=15000)
            time.sleep(1.5)
            
            sugerencias = page.locator("button.list-group-item-action:visible")
            if sugerencias.count() > 0:
                print(f"DEBUG: {sugerencias.count()} sugerencias encontradas")
                sugerencias.first.click()
                print("DEBUG: ✓ Origen seleccionado")
            else:
                print("ERROR: No se encontraron sugerencias de origen")
                return
            
            time.sleep(1)

            # === DESTINO ===
            print(f"\nDEBUG: === CONFIGURANDO DESTINO: {destino} ===")
            destino_input = page.locator("input#place_name_package_to")
            expect(destino_input).to_be_visible(timeout=10000)
            
            destino_input.click()
            time.sleep(0.5)
            destino_input.fill("")
            time.sleep(0.3)
            destino_input.type(destino, delay=150)
            
            print("DEBUG: Esperando sugerencias de destino...")
            page.wait_for_selector("button.list-group-item-action:visible", timeout=15000)
            time.sleep(1.5)
            
            sugerencias_destino = page.locator("button.list-group-item-action:visible")
            if sugerencias_destino.count() > 0:
                print(f"DEBUG: {sugerencias_destino.count()} sugerencias encontradas")
                sugerencias_destino.first.click()
                print("DEBUG: ✓ Destino seleccionado")
            else:
                print("ERROR: No se encontraron sugerencias de destino")
                return
            
            time.sleep(1)

            # === FECHAS ===
            print(f"\nDEBUG: === CONFIGURANDO FECHAS ===")
            print(f"Ida: {fecha_ida} | Vuelta: {fecha_vuelta}")
            
            # Abrir calendario
            fecha_input = page.locator("input#calendar-checkIn-package")
            expect(fecha_input).to_be_visible(timeout=10000)
            fecha_input.click()
            
            print("DEBUG: Esperando calendario easepick...")
            page.wait_for_selector(".easepick-wrapper .container", timeout=15000)
            time.sleep(2)
            
            # Seleccionar fecha de IDA
            print(f"\nDEBUG: === SELECCIONANDO FECHA DE IDA ===")
            if not seleccionar_fecha_easepick(page, fecha_ida, es_fecha_vuelta=False):
                print("ERROR: No se pudo seleccionar fecha de ida")
                page.screenshot(path="error_fecha_ida.png", full_page=True)
                return
            
            print(f"DEBUG: ✓ Fecha de ida seleccionada: {fecha_ida}")
            time.sleep(1)
            
            # Seleccionar fecha de VUELTA
            print(f"\nDEBUG: === SELECCIONANDO FECHA DE VUELTA ===")
            if not seleccionar_fecha_easepick(page, fecha_vuelta, es_fecha_vuelta=True):
                print("ERROR: No se pudo seleccionar fecha de vuelta")
                page.screenshot(path="error_fecha_vuelta.png", full_page=True)
                return
            
            print(f"DEBUG: ✓ Fecha de vuelta seleccionada: {fecha_vuelta}")
            time.sleep(1.5)

            # === BUSCAR ===
            print("\nDEBUG: === EJECUTANDO BÚSQUEDA ===")
            buscar_btn = page.locator("button.btnPrimary:has-text('Buscar'), button.btnPrimary:has-text('BUSCAR')")
            
            if buscar_btn.count() > 0:
                print("DEBUG: Haciendo clic en botón Buscar...")
                buscar_btn.first.click()
            else:
                print("ERROR: No se encontró el botón de búsqueda")
                return

            # === ESPERAR RESULTADOS ===
            print("\nDEBUG: === ESPERANDO RESULTADOS ===")
            page.wait_for_load_state("domcontentloaded", timeout=60000)
            time.sleep(5)
            
            print(f"DEBUG: URL actual: {page.url}")
            
            page.screenshot(path="pricetravel_resultados.png", full_page=True)
            print("DEBUG: Screenshot guardado en: pricetravel_resultados.png")
            
            # === EXTRAER DATOS ===
            print("\n" + "=" * 60)
            print("=== EXTRAYENDO INFORMACIÓN ===")
            print("=" * 60)
            
            vuelos = extraer_vuelo_recomendado(page)
            paquetes = extraer_paquetes(page)
            
            resultado_final = {
                "busqueda": {
                    "origen": origen,
                    "destino": destino,
                    "fecha_ida": fecha_ida,
                    "fecha_vuelta": fecha_vuelta
                },
                "vuelos": vuelos,
                "paquetes": paquetes,
                "total_encontrados": len(paquetes)
            }
            
            print("\n" + "=" * 60)
            print("=== RESULTADOS FINALES ===")
            print("=" * 60)
            print(json.dumps(resultado_final, ensure_ascii=False, indent=2))
            
            if os.environ.get("OUTPUT_MODE") == "api":
                print("\n__JSON_START__")
                print(json.dumps(resultado_final, ensure_ascii=False))
                print("__JSON_END__")
            else:
                print("\n" + "=" * 60)
                input("Presiona ENTER para cerrar el navegador...")

        except Exception as e:
            print(f"\n❌ ERROR CRÍTICO: {e}")
            import traceback
            traceback.print_exc()
            
            page.screenshot(path="pricetravel_error.png", full_page=True)
            print("Screenshot de error guardado: pricetravel_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("=" * 60)
        print("Uso: python pricetravel_worker.py <origen> <destino> <fecha_ida> <fecha_vuelta> <tipo> [perfil]")
        print("=" * 60)
        print("\nEjemplo:")
        print('  python pricetravel_worker.py "Londres" "Cancún" "2025-12-25" "2025-12-30" "PAQUETE"')
        print("\nFormato de fechas: YYYY-MM-DD")
        print("=" * 60)
        sys.exit(1)
    
    origen = sys.argv[1]
    destino = sys.argv[2]
    fecha_ida = sys.argv[3]
    fecha_vuelta = sys.argv[4]
    tipo = sys.argv[5]
    perfil = sys.argv[6] if len(sys.argv) > 6 else "Default"
    
    run(origen, destino, fecha_ida, fecha_vuelta, tipo, perfil)