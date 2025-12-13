import sys, time, re, json, os
from datetime import datetime
from playwright.sync_api import sync_playwright, expect

def parse_precio(texto: str) -> int:
    """Extrae números de un texto de precio y lo convierte a entero"""
    numeros = re.findall(r"\d+", texto.replace(",", "").replace(".", "").replace("$", "").replace("MXN", "").strip())
    return int("".join(numeros)) if numeros else 0
def configurar_huespedes(page, habitaciones, adultos, ninos):
    """Configura el número de huéspedes y habitaciones siguiendo la lógica exacta del sitio"""
    try:
        print(f"\n{'='*60}")
        print("CONFIGURING GUESTS")
        print(f"{'='*60}")
        print(f"Target: {habitaciones} room(s), {adultos} adult(s), {ninos} children")
        
        # 1. Abrir el modal de huéspedes
        paxes_input = page.locator("input#packages_pax-value")
        expect(paxes_input).to_be_visible(timeout=10000)
        paxes_input.click()
        time.sleep(2)
        
        # Esperar a que aparezca el modal
        page.wait_for_selector("div.search-paxes.modal-active", timeout=10000)
        time.sleep(1.5)
        
        print("\n✓ Modal opened successfully")
        
        # 2. AGREGAR HABITACIONES SI ES NECESARIO
        habitaciones_actuales = page.locator("div.search-paxes .col-12.mobile-list").count()
        print(f"\nCurrent rooms: {habitaciones_actuales}")
        print(f"Target rooms: {habitaciones}")
        
        if habitaciones > habitaciones_actuales:
            habitaciones_a_agregar = habitaciones - habitaciones_actuales
            print(f"\n→ Adding {habitaciones_a_agregar} room(s)...")
            
            btn_add_room = page.locator("button.btnTertiary:has-text('Add another room'), button.btnTertiary:has-text('Agregar habitación')")
            
            for i in range(habitaciones_a_agregar):
                if btn_add_room.count() > 0:
                    btn_add_room.first.click()
                    time.sleep(1.5)
                    print(f"  ✓ Room {habitaciones_actuales + i + 1} added")
                else:
                    print(f"  ✗ Add room button not found")
                    break
            
            # Verificar
            habitaciones_finales = page.locator("div.search-paxes .col-12.mobile-list").count()
            print(f"✓ Total rooms after adding: {habitaciones_finales}")
        
        # 3. DISTRIBUIR PASAJEROS POR HABITACIÓN
        adultos_por_hab = adultos // habitaciones
        ninos_por_hab = ninos // habitaciones
        adultos_restantes = adultos % habitaciones
        ninos_restantes = ninos % habitaciones
        
        print(f"\n{'='*60}")
        print("DISTRIBUTION PLAN")
        print(f"{'='*60}")
        print(f"Base per room: {adultos_por_hab} adult(s), {ninos_por_hab} children")
        print(f"Extra to distribute: {adultos_restantes} adult(s), {ninos_restantes} children")
        
        # 4. CONFIGURAR CADA HABITACIÓN
        for hab_idx in range(habitaciones):
            print(f"\n{'─'*60}")
            print(f"CONFIGURING ROOM {hab_idx + 1}")
            print(f"{'─'*60}")
            
            # Calcular pasajeros para esta habitación
            adultos_esta_hab = adultos_por_hab + (1 if hab_idx < adultos_restantes else 0)
            ninos_esta_hab = ninos_por_hab + (1 if hab_idx < ninos_restantes else 0)
            
            print(f"Target: {adultos_esta_hab} adult(s), {ninos_esta_hab} children")
            
            # Localizar el contenedor de esta habitación
            room_container = page.locator("div.search-paxes .col-12.mobile-list").nth(hab_idx)
            
            if room_container.count() == 0:
                print(f"✗ Room {hab_idx + 1} container not found!")
                continue
            
            # Verificar el título de la habitación para asegurar que estamos en la correcta
            room_title = room_container.locator("p.h5.mb-0").first
            if room_title.count() > 0:
                title_text = room_title.inner_text().strip()
                print(f"  Verified: {title_text}")
            
            # ===== RESETEAR Y CONFIGURAR ADULTOS =====
            print(f"\n→ Configuring adults...")
            
            # Dar tiempo para que se renderice la habitación
            time.sleep(0.5)
            
            # Leer el contador actual de adultos
            adultos_counter = room_container.locator("div.row:has-text('Adults') p.input-stepper-counter, div.row:has-text('Adultos') p.input-stepper-counter").first
            
            if adultos_counter.count() == 0:
                print("  ✗ Adults counter not found")
            else:
                try:
                    adultos_actuales_text = adultos_counter.inner_text().strip()
                    adultos_actuales = int(adultos_actuales_text)
                    print(f"  Current: {adultos_actuales} adult(s)")
                    print(f"  Target: {adultos_esta_hab} adult(s)")
                    
                    # PASO 1: RESETEAR A 1 (mínimo permitido)
                    # Primero bajar todos los adultos al mínimo (1)
                    if adultos_actuales > 1:
                        clicks_para_resetear = adultos_actuales - 1
                        print(f"  → Resetting to minimum (1 adult)...")
                        btn_remove = room_container.locator("div.row:has-text('Adults') button:has(i.icons-remove), div.row:has-text('Adultos') button:has(i.icons-remove)").first
                        
                        for _ in range(clicks_para_resetear):
                            if btn_remove.count() > 0:
                                btn_remove.click()
                                time.sleep(0.3)
                            else:
                                print("    ✗ Remove button not found")
                                break
                        
                        # Verificar que llegamos a 1
                        nuevo_valor = int(room_container.locator("div.row:has-text('Adults') p.input-stepper-counter, div.row:has-text('Adultos') p.input-stepper-counter").first.inner_text().strip())
                        print(f"    Reset: {adultos_actuales} → {nuevo_valor}")
                    
                    # PASO 2: AGREGAR DESDE 1 HASTA EL TARGET
                    # Ahora agregar desde 1 hasta el target
                    if adultos_esta_hab > 1:
                        clicks_para_agregar = adultos_esta_hab - 1
                        print(f"  → Adding {clicks_para_agregar} adult(s) from minimum...")
                        btn_add = room_container.locator("div.row:has-text('Adults') button:has(i.icons-add), div.row:has-text('Adultos') button:has(i.icons-add)").first
                        
                        for _ in range(clicks_para_agregar):
                            if btn_add.count() > 0:
                                btn_add.click()
                                time.sleep(0.3)
                            else:
                                print("    ✗ Add button not found")
                                break
                        
                        # Verificar el valor final
                        valor_final = int(room_container.locator("div.row:has-text('Adults') p.input-stepper-counter, div.row:has-text('Adultos') p.input-stepper-counter").first.inner_text().strip())
                        print(f"  ✓ Adults configured: 1 → {valor_final}")
                    else:
                        print(f"  ✓ Adults already at minimum (1)")
                
                except Exception as e:
                    print(f"  ✗ Error configuring adults: {e}")
            
            # ===== RESETEAR Y CONFIGURAR NIÑOS =====
            print(f"\n→ Configuring children...")
            
            # Dar tiempo para que se actualice el DOM después de configurar adultos
            time.sleep(0.5)
            
            # Leer el contador actual de niños
            ninos_counter = room_container.locator("div.row:has-text('Children') p.input-stepper-counter, div.row:has-text('Menores') p.input-stepper-counter").first
            
            if ninos_counter.count() == 0:
                print("  ✗ Children counter not found")
            else:
                try:
                    ninos_actuales_text = ninos_counter.inner_text().strip()
                    ninos_actuales = int(ninos_actuales_text)
                    print(f"  Current: {ninos_actuales} children")
                    print(f"  Target: {ninos_esta_hab} children")
                    
                    # PASO 1: RESETEAR A 0 (mínimo permitido para niños)
                    # Primero bajar todos los niños a 0
                    if ninos_actuales > 0:
                        clicks_para_resetear = ninos_actuales
                        print(f"  → Resetting to minimum (0 children)...")
                        btn_remove = room_container.locator("div.row:has-text('Children') button:has(i.icons-remove), div.row:has-text('Menores') button:has(i.icons-remove)").first
                        
                        for _ in range(clicks_para_resetear):
                            if btn_remove.count() > 0:
                                btn_remove.click()
                                time.sleep(0.4)
                            else:
                                print("    ✗ Remove button not found")
                                break
                        
                        # Verificar que llegamos a 0
                        nuevo_valor = int(room_container.locator("div.row:has-text('Children') p.input-stepper-counter, div.row:has-text('Menores') p.input-stepper-counter").first.inner_text().strip())
                        print(f"    Reset: {ninos_actuales} → {nuevo_valor}")
                        time.sleep(0.5)  # Dar tiempo para que desaparezcan los selectores de edad
                    
                    # PASO 2: AGREGAR DESDE 0 HASTA EL TARGET
                    # Ahora agregar desde 0 hasta el target
                    if ninos_esta_hab > 0:
                        clicks_para_agregar = ninos_esta_hab
                        print(f"  → Adding {clicks_para_agregar} children from minimum...")
                        btn_add = room_container.locator("div.row:has-text('Children') button:has(i.icons-add), div.row:has-text('Menores') button:has(i.icons-add)").first
                        
                        for click_idx in range(clicks_para_agregar):
                            if btn_add.count() > 0:
                                btn_add.click()
                                time.sleep(0.7)  # Más tiempo porque aparecen selectores de edad
                                print(f"    Child {click_idx + 1} added")
                            else:
                                print("    ✗ Add button not found")
                                break
                        
                        # Verificar el valor final
                        valor_final = int(room_container.locator("div.row:has-text('Children') p.input-stepper-counter, div.row:has-text('Menores') p.input-stepper-counter").first.inner_text().strip())
                        print(f"  ✓ Children configured: 0 → {valor_final}")
                    else:
                        print(f"  ✓ No children needed for this room")
                
                except Exception as e:
                    print(f"  ✗ Error configuring children: {e}")
            
            # ===== CONFIGURAR EDADES DE NIÑOS =====
            if ninos_esta_hab > 0:
                print(f"\n→ Configuring children ages...")
                time.sleep(1.5)  # Dar tiempo para que aparezcan los selectores
                
                # Buscar todos los selectores de edad dentro de esta habitación
                # Los selectores tienen name="children_{paxIndex}_{childIndex}"
                age_selects = room_container.locator("select[name^='children']")
                selects_count = age_selects.count()
                
                print(f"  Found {selects_count} age selector(s)")
                
                if selects_count > 0:
                    for child_idx in range(min(selects_count, ninos_esta_hab)):
                        try:
                            select = age_selects.nth(child_idx)
                            
                            # Verificar si ya tiene un valor
                            current_value = select.input_value()
                            
                            if not current_value or current_value == "null" or current_value == "object:null":
                                # Seleccionar 5 años (value="number:6")
                                # En PriceTravel: 1=0-23months, 2=2years, 3=3years, etc.
                                select.select_option(value="number:6")
                                time.sleep(0.4)
                                print(f"    ✓ Child {child_idx + 1}: Set to 5 years")
                            else:
                                print(f"    ℹ Child {child_idx + 1}: Age already set")
                        
                        except Exception as e:
                            print(f"    ✗ Error setting age for child {child_idx + 1}: {e}")
                    
                    print(f"  ✓ All ages configured for room {hab_idx + 1}")
                else:
                    print(f"  ⚠ No age selectors found (expected {ninos_esta_hab})")
        
        # 5. APLICAR CAMBIOS
        print(f"\n{'='*60}")
        print("APPLYING CONFIGURATION")
        print(f"{'='*60}")
        time.sleep(2)  # Dar tiempo para que se procese todo
        
        # Buscar el botón Apply
        apply_btn = page.locator("button[name='apply-button']")
        
        if apply_btn.count() == 0:
            print("✗ Apply button not found!")
            return False
        
        # Verificar si está habilitado
        is_disabled = apply_btn.evaluate("btn => btn.disabled")
        
        if is_disabled:
            print("⚠ Apply button is DISABLED")
            print("→ Checking for missing age selectors...")
            
            # Intentar llenar TODOS los selectores vacíos en TODO el modal
            all_selects = page.locator("select[name^='children']")
            total_selects = all_selects.count()
            
            print(f"  Found {total_selects} total age selector(s) in modal")
            
            filled_count = 0
            for i in range(total_selects):
                try:
                    select = all_selects.nth(i)
                    current_value = select.input_value()
                    
                    if not current_value or current_value == "null" or current_value == "object:null":
                        select.select_option(value="number:6")
                        time.sleep(0.3)
                        filled_count += 1
                        print(f"    Filled selector {i + 1}")
                except:
                    pass
            
            if filled_count > 0:
                print(f"  ✓ Filled {filled_count} missing age selector(s)")
                time.sleep(1)
                
                # Re-verificar si ahora está habilitado
                is_disabled = apply_btn.evaluate("btn => btn.disabled")
                
                if is_disabled:
                    print("  ⚠ Button still disabled after filling ages")
                else:
                    print("  ✓ Button is now enabled!")
        else:
            print("✓ Apply button is enabled")
        
        # Intentar hacer click de todas formas
        print("\n→ Clicking Apply button...")
        try:
            apply_btn.click(force=True, timeout=5000)
            time.sleep(2.5)
            print("✓ Apply button clicked successfully")
        except Exception as e:
            print(f"⚠ Could not click Apply button: {e}")
            print("→ Trying alternative: Close button...")
            
            close_btn = page.locator("button:has(i.icons-close)").first
            if close_btn.count() > 0:
                close_btn.click()
                time.sleep(1.5)
                print("✓ Modal closed with close button")
        
        # 6. VERIFICAR QUE EL MODAL SE CERRÓ
        time.sleep(1)
        modal_visible = page.locator("div.search-paxes.modal-active").count() > 0
        
        if modal_visible:
            print("\n⚠ Modal still visible after clicking Apply")
            print("→ Trying to close by clicking outside...")
            page.mouse.click(50, 50)
            time.sleep(1)
            
            modal_visible = page.locator("div.search-paxes.modal-active").count() > 0
            if not modal_visible:
                print("✓ Modal closed by clicking outside")
            else:
                print("✗ Modal could not be closed")
                return False
        else:
            print("✓ Modal closed successfully")
        
        print(f"\n{'='*60}")
        print("✓ GUEST CONFIGURATION COMPLETED")
        print(f"{'='*60}\n")
        
        return True
        
    except Exception as e:
        print(f"\n{'='*60}")
        print("✗ CRITICAL ERROR IN GUEST CONFIGURATION")
        print(f"{'='*60}")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        
        try:
            page.screenshot(path="error_huespedes.png", full_page=True)
            print("\n📸 Screenshot saved: error_huespedes.png")
        except:
            pass
        
        return False

def extraer_vuelo_recomendado(page):
    """Extrae información del vuelo recomendado (ida y regreso)"""
    vuelos = {"ida": {}, "regreso": {}}
    
    time.sleep(8)
    
    try:
        print("\nDEBUG: Extracting flight information...")
        
        vuelo_container = page.locator("div.c-box-air")
        
        if vuelo_container.count() == 0:
            print("WARNING: Flight container not found")
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
                
                print(f"DEBUG: Outbound Flight - {vuelos['ida'].get('origen', 'N/A')} -> {vuelos['ida'].get('destino', 'N/A')}")
            except Exception as e:
                print(f"Error extracting outbound flight: {e}")
        
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
                
                print(f"DEBUG: Return Flight - {vuelos['regreso'].get('origen', 'N/A')} -> {vuelos['regreso'].get('destino', 'N/A')}")
            except Exception as e:
                print(f"Error extracting return flight: {e}")
    
    except Exception as e:
        print(f"General error extracting flights: {e}")
    
    return vuelos

def extraer_paquetes(page):
    """Extrae las primeras 10 opciones de paquetes"""
    resultados = []
    
    try:
        print("\nDEBUG: Extracting packages...")
        
        page.wait_for_selector("div.pth-card", timeout=30000)
        time.sleep(2)
        
        paquetes = page.locator("div.pth-card")
        total = paquetes.count()
        print(f"DEBUG: Total packages found: {total}")
        
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
                
                plan_alimentos = "No meals included"
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
                print(f"DEBUG: Package {i+1}/10 - {nombre} - ${precio_persona:,} MXN")
                
            except Exception as e:
                print(f"Error processing package {i+1}: {e}")
                continue
    
    except Exception as e:
        print(f"Error extracting packages: {e}")
    
    return resultados
def seleccionar_fecha_easepick(page, fecha_objetivo, es_fecha_vuelta=False):
    """Selecciona una fecha en el calendario easepick usando data-time dentro de Shadow DOM"""
    try:
        fecha_obj = datetime.strptime(fecha_objetivo, "%Y-%m-%d")
        timestamp_objetivo = int(fecha_obj.timestamp() * 1000)

        mes_objetivo = fecha_obj.month
        año_objetivo = fecha_obj.year
        dia_objetivo = fecha_obj.day

        meses_en = ["january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"]

        print(f"\n{'='*60}")
        print(f"SEARCHING {'RETURN' if es_fecha_vuelta else 'DEPARTURE'} DATE")
        print(f"{'='*60}")
        print(f"Target: {dia_objetivo} {meses_en[mes_objetivo-1].capitalize()} {año_objetivo}")
        print(f"Timestamp: {timestamp_objetivo}")

        shadow_host = page.locator("span.easepick-wrapper")

        max_intentos = 24
        intentos = 0

        while intentos < max_intentos:
            time.sleep(1)

            calendars_info = page.evaluate("""
                () => {
                    const shadowHost = document.querySelector('span.easepick-wrapper');
                    if (!shadowHost || !shadowHost.shadowRoot) return null;

                    const calendars = shadowHost.shadowRoot.querySelectorAll('div.calendar');
                    const result = [];

                    calendars.forEach((cal, idx) => {
                        const monthNameDiv = cal.querySelector('.month-name');
                        if (monthNameDiv) {
                            const fullText = monthNameDiv.textContent.trim();
                            result.push({
                                index: idx,
                                header: fullText
                            });
                        }
                    });

                    return result;
                }
            """)

            if not calendars_info:
                print(f"Attempt {intentos + 1}/{max_intentos} - Shadow DOM not ready")
                intentos += 1
                continue

            print(f"\nAttempt {intentos + 1}/{max_intentos} - Found {len(calendars_info)} calendars")

            found = False
            for cal_info in calendars_info:
                cal_idx = cal_info['index']
                header_text = cal_info['header']

                print(f"  Calendar {cal_idx + 1}: '{header_text}'")

                partes = header_text.lower().split()
                if len(partes) < 2:
                    continue

                mes_nombre = partes[0].strip()
                try:
                    año_calendario = int(partes[1].strip())
                except ValueError:
                    continue

                mes_objetivo_nombre = meses_en[mes_objetivo - 1]

                if mes_nombre == mes_objetivo_nombre and año_calendario == año_objetivo:
                    print(f"  ✓ MATCH FOUND in Calendar {cal_idx + 1}")

                    day_clicked = page.evaluate(f"""
                        (timestamp) => {{
                            const shadowHost = document.querySelector('span.easepick-wrapper');
                            if (!shadowHost || !shadowHost.shadowRoot) return false;

                            const calendars = shadowHost.shadowRoot.querySelectorAll('div.calendar');
                            const calendar = calendars[{cal_idx}];
                            if (!calendar) return false;

                            const days = calendar.querySelectorAll('div.day.unit:not(.not-available)');

                            for (let day of days) {{
                                const dataTime = day.getAttribute('data-time');
                                if (dataTime) {{
                                    const dayTimestamp = parseInt(dataTime);
                                    const diff = Math.abs(dayTimestamp - timestamp);
                                    const diffHours = diff / (1000 * 60 * 60);

                                    if (diffHours < 12) {{
                                        day.click();
                                        return true;
                                    }}
                                }}
                            }}

                            return false;
                        }}
                    """, timestamp_objetivo)

                    if day_clicked:
                        print(f"  ✓ DAY CLICKED successfully")
                        time.sleep(1.5)
                        return True
                    else:
                        print(f"  ✗ Day {dia_objetivo} not found in this calendar")

            # Si no encontramos el mes/año, decidir si avanzar o retroceder
            if not found:
                # Tomar el primer calendario como referencia
                ref_header = calendars_info[0]['header'].lower().split()
                if len(ref_header) >= 2:
                    mes_actual_nombre = ref_header[0]
                    año_actual = int(ref_header[1])
                    mes_actual_index = meses_en.index(mes_actual_nombre)

                    mes_objetivo_index = mes_objetivo - 1

                    if año_actual > año_objetivo or (año_actual == año_objetivo and mes_actual_index > mes_objetivo_index):
                        print("  → Going to previous month...")
                        page.evaluate("""
                            () => {
                                const shadowHost = document.querySelector('span.easepick-wrapper');
                                if (!shadowHost || !shadowHost.shadowRoot) return false;
                                const prevButtons = shadowHost.shadowRoot.querySelectorAll('button.previous-button.unit');
                                if (prevButtons.length > 0) {
                                    prevButtons[0].click();
                                    return true;
                                }
                                return false;
                            }
                        """)
                    else:
                        print("  → Moving to next month...")
                        page.evaluate("""
                            () => {
                                const shadowHost = document.querySelector('span.easepick-wrapper');
                                if (!shadowHost || !shadowHost.shadowRoot) return false;
                                const nextButtons = shadowHost.shadowRoot.querySelectorAll('button.next-button.unit');
                                if (nextButtons.length > 0) {
                                    nextButtons[nextButtons.length - 1].click();
                                    return true;
                                }
                                return false;
                            }
                        """)

                time.sleep(1)

            intentos += 1

        print(f"\n✗ Could not find date after {max_intentos} attempts")
        return False

    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def run(origen, destino, fecha_ida, fecha_vuelta, habitaciones, adultos, ninos, perfil="Default"):
    with sync_playwright() as p:
        proxy_server = os.environ.get("HTTP_PROXY")
        proxy_config = {"server": proxy_server} if proxy_server else None

        perfil_path = f"/home/KALI/.config/microsoft-edge/{perfil}"
        print(f"Using Edge profile: {perfil_path}")

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
            print("STARTING PRICETRAVEL SEARCH")
            print("=" * 60)
            
            page.goto("https://www.pricetravel.com/es/paquetes", wait_until="domcontentloaded")
            time.sleep(3)

            # === CAMBIAR IDIOMA A INGLÉS ===
            print("\n=== CHANGING LANGUAGE TO ENGLISH ===")
            try:
                # Click en el botón de idioma (puede ser Español o el selector de idioma)
                lang_button = page.locator("button.header__btn:has-text('Español'), button.header__btn:has-text('ES')")
                if lang_button.count() > 0:
                    lang_button.first.click()
                    time.sleep(1.5)
                    
                    # Click en el label específico para inglés
                    english_label = page.locator("label[for='https://www.pricetravel.com/en/packages']")
                    if english_label.count() > 0:
                        english_label.click()
                        time.sleep(1)
                        print("✓ English language option selected")
                        
                        # Click en el botón Aplicar
                        apply_button = page.locator("button.btnPrimary.w-100:has-text('Aplicar')")
                        if apply_button.count() > 0:
                            apply_button.click()
                            time.sleep(4)  # Esperar 4 segundos después de aplicar el cambio
                            print("✓ Language change applied successfully")
                        else:
                            print("⚠ Apply button not found")
                    else:
                        print("⚠ English label not found, trying alternative method")
                        # Método alternativo: buscar directamente el input radio
                        english_radio = page.locator("input[value='https://www.pricetravel.com/en/packages']")
                        if english_radio.count() > 0:
                            english_radio.click()
                            time.sleep(1)
                            apply_button = page.locator("button.btnPrimary.w-100:has-text('Aplicar')")
                            if apply_button.count() > 0:
                                apply_button.click()
                                time.sleep(4)  # Esperar 4 segundos después de aplicar el cambio
                                print("✓ Language changed via alternative method")
                else:
                    print("⚠ Language button not found, continuing in current language")
            except Exception as e:
                print(f"⚠ Could not change language: {e}")
                print("Continuing with current language...")

            # === ORIGEN ===
            print(f"\n=== ORIGIN: {origen} ===")
            origen_input = page.locator("input#place_name_package")
            expect(origen_input).to_be_visible(timeout=10000)
            
            origen_input.click()
            time.sleep(0.5)
            origen_input.fill("")
            time.sleep(0.3)
            origen_input.type(origen, delay=150)
            
            page.wait_for_selector("button.list-group-item-action:visible", timeout=15000)
            time.sleep(1.5)
            
            sugerencias = page.locator("button.list-group-item-action:visible")
            if sugerencias.count() > 0:
                sugerencias.first.click()
                print("✓ Origin selected")
            else:
                print("✗ No suggestions found")
                return
            
            time.sleep(1)

            # === DESTINO ===
            print(f"\n=== DESTINATION: {destino} ===")
            destino_input = page.locator("input#place_name_package_to")
            expect(destino_input).to_be_visible(timeout=10000)
            
            destino_input.click()
            time.sleep(0.5)
            destino_input.fill("")
            time.sleep(0.3)
            destino_input.type(destino, delay=150)
            
            page.wait_for_selector("button.list-group-item-action:visible", timeout=15000)
            time.sleep(1.5)
            
            sugerencias_destino = page.locator("button.list-group-item-action:visible")
            if sugerencias_destino.count() > 0:
                sugerencias_destino.first.click()
                print("✓ Destination selected")
            else:
                print("✗ No suggestions found")
                return
            
            time.sleep(1)

            # === FECHAS ===
            print(f"\n=== DATES ===")
            print(f"Departure: {fecha_ida}")
            print(f"Return: {fecha_vuelta}")
            
            fecha_input = page.locator("input#calendar-checkIn-package")
            expect(fecha_input).to_be_visible(timeout=10000)
            fecha_input.click()
            
            # Esperar a que aparezca el shadow root del calendario
            print("DEBUG: Waiting for shadow root calendar...")
            time.sleep(3)
            
            if not seleccionar_fecha_easepick(page, fecha_ida, es_fecha_vuelta=False):
                print("✗ Could not select departure date")
                page.screenshot(path="error_departure.png")
                return
            
            print("✓ Departure date selected")
            time.sleep(1)
            
            if not seleccionar_fecha_easepick(page, fecha_vuelta, es_fecha_vuelta=True):
                print("✗ Could not select return date")
                page.screenshot(path="error_return.png")
                return
            
            print("✓ Return date selected")
            time.sleep(1.5)

            # === HUÉSPEDES ===
            if not configurar_huespedes(page, habitaciones, adultos, ninos):
                print("✗ Could not configure guests")
                return

            # === BUSCAR ===
            print("\n=== SEARCH ===")
            buscar_btn = page.locator("button.btnPrimary:has-text('Buscar'), button.btnPrimary:has-text('BUSCAR'), button.btnPrimary:has-text('Search'), button.btnPrimary:has-text('SEARCH')")
            
            if buscar_btn.count() > 0:
                buscar_btn.first.click()
            else:
                print("✗ Search button not found")
                return

            # === ESPERAR RESULTADOS ===
            print("\n=== WAITING FOR RESULTS ===")
            page.wait_for_load_state("domcontentloaded", timeout=60000)
            
            # ESPERAR 13 SEGUNDOS para que cargue toda la información
            print("Waiting 13 seconds for all data to load...")
            time.sleep(13)
            
            print(f"Current URL: {page.url}")
            
            # === EXTRAER DATOS ===
            print("\n" + "=" * 60)
            print("EXTRACTING DATA")
            print("=" * 60)
            
            vuelos = extraer_vuelo_recomendado(page)
            paquetes = extraer_paquetes(page)
            
            resultado_final = {
                "busqueda": {
                    "origen": origen,
                    "destino": destino,
                    "fecha_ida": fecha_ida,
                    "fecha_vuelta": fecha_vuelta,
                    "habitaciones": habitaciones,
                    "adultos": adultos,
                    "ninos": ninos
                },
                "vuelos": vuelos,
                "paquetes": paquetes,
                "total_encontrados": len(paquetes)
            }
            
            if os.environ.get("OUTPUT_MODE") == "api":
                print("\n__JSON_START__")
                print(json.dumps(resultado_final, ensure_ascii=False))
                print("__JSON_END__")
            else:
                print("\n" + "=" * 60)
                print("FINAL RESULTS")
                print("=" * 60)
                print(json.dumps(resultado_final, ensure_ascii=False, indent=2))
                input("Press ENTER to close browser...")

        except Exception as e:
            print(f"\n✗ CRITICAL ERROR: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path="pricetravel_error.png", full_page=True)

        finally:
            browser.close()

if __name__ == "__main__":
    if len(sys.argv) < 8:
        print("=" * 60)
        print("Usage: python playwright_worker_price.py <origin> <destination> <departure> <return> <rooms> <adults> <children> [profile]")
        print("=" * 60)
        print("\nExample:")
        print('  python playwright_worker_price.py "Sydney" "Mexico City" "2025-12-24" "2025-12-29" 1 2 0')
        print("\nDate format: YYYY-MM-DD")
        sys.exit(1)
    
    origen = sys.argv[1]
    destino = sys.argv[2]
    fecha_ida = sys.argv[3]
    fecha_vuelta = sys.argv[4]
    habitaciones = int(sys.argv[5])
    adultos = int(sys.argv[6])
    ninos = int(sys.argv[7])
    perfil = sys.argv[8] if len(sys.argv) > 8 else "Default"
    
    run(origen, destino, fecha_ida, fecha_vuelta, habitaciones, adultos, ninos, perfil)