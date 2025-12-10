// app/api/cotizar/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

interface CotizarRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  rooms: number;
  adults: number;
  children: number;
  roomDetails: Array<{ adults: number; children: number }>;
  packageType: string;
}

interface WorkerResult {
  busqueda: {
    origen: string;
    destino: string;
    fecha_ida: string;
    fecha_vuelta: string;
    habitaciones: number;
    adultos: number;
    ninos: number;
  };
  vuelos: {
    ida: {
      aerolinea?: string;
      origen?: string;
      hora_salida?: string;
      tipo?: string;
      destino?: string;
      hora_llegada?: string;
      escalas?: string;
    };
    regreso: {
      aerolinea?: string;
      origen?: string;
      hora_salida?: string;
      tipo?: string;
      destino?: string;
      hora_llegada?: string;
      escalas?: string;
    };
  };
  paquetes: Array<{
    hotel_name: string;
    ciudad: string;
    estrellas: string;
    calificacion: string;
    opiniones: string;
    plan_alimentos: string;
    precio_original: number | null;
    precio_persona: number | string;
    precio_total: number | string;
    descuento: string | null;
    imagen: string;
    url: string;
  }>;
  total_encontrados: number;
  error?: string;
}

async function runWorker(
  origen: string,
  destino: string,
  fechaIda: string,
  fechaVuelta: string,
  habitaciones: number,
  adultos: number,
  ninos: number
): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), "scripts/playwright_worker_price.py");

    console.log("=".repeat(60));
    console.log("🚀 Executing worker:", {
      script: scriptPath,
      args: [origen, destino, fechaIda, fechaVuelta, habitaciones, adultos, ninos]
    });
    console.log("=".repeat(60));

    // Spawn del proceso Python
    const python = spawn("python3", [
      scriptPath,
      origen,
      destino,
      fechaIda,
      fechaVuelta,
      habitaciones.toString(),
      adultos.toString(),
      ninos.toString()
    ], {
      env: { ...process.env, OUTPUT_MODE: "api" },
      timeout: 300000 // 5 minutos
    });

    let outputData = "";
    let errorData = "";
    const workerStartTime = Date.now();
    let lastLogTime = Date.now();

    python.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      
      // Solo imprimir logs si no están entre los marcadores JSON
      if (!text.includes('__JSON_START__') && !text.includes('__JSON_END__')) {
        const now = Date.now();
        // Log con throttle para no saturar (cada 2 segundos)
        if (now - lastLogTime > 2000) {
          console.log("⏳ Worker progress:", text.trim().substring(0, 100));
          lastLogTime = now;
        }
      }
      
      outputData += text;
    });

    python.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      console.error("⚠️ Worker stderr:", text.trim());
      errorData += text;
    });

    python.on("close", (code) => {
      const elapsedTime = ((Date.now() - workerStartTime) / 1000).toFixed(2);
      console.log("=".repeat(60));
      console.log(`✅ Worker finished with code: ${code} in ${elapsedTime}s`);
      console.log("=".repeat(60));

      // Si el código no es 0, intentar extraer JSON de todas formas
      if (code !== 0 && code !== null) {
        console.error("❌ Non-zero exit code:", code);
        console.error("Error output:", errorData.substring(0, 500));
        
        // Intentar extraer JSON incluso si el código de salida no es 0
        const jsonMatch = outputData.match(/__JSON_START__\s*([\s\S]*?)\s*__JSON_END__/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const result = JSON.parse(jsonMatch[1].trim());
            if (result.error) {
              console.error("❌ Worker returned error in JSON:", result.error);
              reject(new Error(result.error));
            } else {
              console.log("✓ JSON extracted despite non-zero exit code");
              resolve(result);
            }
            return;
          } catch (e) {
            console.error("❌ Failed to parse JSON from failed worker");
            // Continuar con el error original
          }
        }
        
        reject(new Error(`Worker failed with code ${code}: ${errorData || 'Unknown error'}`));
        return;
      }

      try {
        // Buscar el JSON entre marcadores
        const jsonStartMatch = outputData.match(/__JSON_START__\s*([\s\S]*?)\s*__JSON_END__/);
        
        if (jsonStartMatch && jsonStartMatch[1]) {
          console.log("✓ JSON found between markers");
          const jsonStr = jsonStartMatch[1].trim();
          
          // Validar que sea JSON válido antes de parsear
          if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) {
            console.error("❌ Invalid JSON format - doesn't start with { or [");
            console.error("Received:", jsonStr.substring(0, 200));
            reject(new Error("Invalid JSON format received from worker"));
            return;
          }
          
          const result: WorkerResult = JSON.parse(jsonStr);
          
          // Si hay error en el resultado, rechazar con el mensaje específico
          if (result.error) {
            console.error("❌ Worker returned error:", result.error);
            reject(new Error(result.error));
            return;
          }
          
          // Validar estructura básica
          if (!result.paquetes) {
            console.error("❌ Missing 'paquetes' field in result");
            reject(new Error("Invalid data structure: missing 'paquetes' field"));
            return;
          }
          
          if (!Array.isArray(result.paquetes)) {
            console.error("❌ 'paquetes' is not an array");
            reject(new Error("Invalid data structure: 'paquetes' is not an array"));
            return;
          }
          
          if (result.paquetes.length === 0) {
            console.warn("⚠️ No packages found");
            reject(new Error("No packages found for this search. Try different dates or destinations."));
            return;
          }
          
          // Validar que los paquetes tengan precios válidos
          const paquetesValidos = result.paquetes.filter((p: any) => {
            return p.precio_persona && 
                   p.precio_persona !== "N/A" && 
                   p.precio_persona !== 0 &&
                   p.precio_persona !== "0" &&
                   typeof p.precio_persona === 'number' &&
                   !isNaN(p.precio_persona);
          });
          
          if (paquetesValidos.length === 0) {
            console.error("❌ No packages with valid prices");
            if (result.paquetes.length > 0) {
              console.error("Sample package:", JSON.stringify(result.paquetes[0], null, 2));
            }
            reject(new Error("No packages with valid prices found. Data may be incomplete or the site structure changed."));
            return;
          }
          
          if (paquetesValidos.length < result.paquetes.length) {
            console.warn(`⚠️ Only ${paquetesValidos.length} of ${result.paquetes.length} packages have valid prices`);
            // Usar solo paquetes válidos
            result.paquetes = paquetesValidos;
            result.total_encontrados = paquetesValidos.length;
          }
          
          console.log(`✅ ${result.paquetes.length} valid packages found`);
          resolve(result);
          
        } else {
          console.error("❌ No JSON markers found in output");
          console.error("Output length:", outputData.length);
          console.error("First 500 chars:");
          console.error(outputData.substring(0, 500));
          console.error("Last 500 chars:");
          console.error(outputData.substring(Math.max(0, outputData.length - 500)));
          
          reject(new Error("No valid JSON found in worker output. The scraper may have failed to extract data."));
        }
      } catch (e) {
        console.error("❌ Error parsing JSON:", e);
        console.error("Problematic output (first 1000 chars):", outputData.substring(0, 1000));
        
        const errorMessage = e instanceof Error ? e.message : String(e);
        reject(new Error(`Error parsing result: ${errorMessage}`));
      }
    });

    python.on("error", (err) => {
      console.error("❌ Error spawning python:", err);
      reject(new Error(`Error executing worker: ${err.message}`));
    });

    // Manual timeout con mejor logging
    const manualTimeout = setTimeout(() => {
      console.error("⏰ Manual timeout activated - killing worker process");
      console.error("Output received so far (first 500 chars):", outputData.substring(0, 500));
      python.kill('SIGTERM');
      
      // Dar un pequeño tiempo para terminar gracefully
      setTimeout(() => {
        if (!python.killed) {
          console.error("🔪 Force killing worker with SIGKILL");
          python.kill('SIGKILL');
        }
      }, 5000);
      
      reject(new Error("Worker exceeded maximum execution time (5 minutes). The search may be too complex or the site is slow."));
    }, 300000); // 5 minutos

    // Clear timeout si termina antes
    python.on("close", () => {
      clearTimeout(manualTimeout);
    });
  });
}

export async function POST(req: Request) {
  const requestStartTime = Date.now();
  
  try {
    const body: CotizarRequest = await req.json();

    console.log("=".repeat(60));
    console.log("📥 Request received at:", new Date().toISOString());
    console.log("📋 Request data:", {
      origin: body.origin,
      destination: body.destination,
      dates: `${body.departureDate} → ${body.returnDate}`,
      rooms: body.rooms,
      adults: body.adults,
      children: body.children
    });
    console.log("=".repeat(60));

    // ========== VALIDACIONES ==========
    
    // Origen y Destino
    if (!body.origin || !body.destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    if (body.origin.trim().length < 2 || body.destination.trim().length < 2) {
      return NextResponse.json(
        { error: "Origin and destination must have at least 2 characters" },
        { status: 400 }
      );
    }

    // Fechas
    if (!body.departureDate || !body.returnDate) {
      return NextResponse.json(
        { error: "Departure and return dates are required" },
        { status: 400 }
      );
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.departureDate) || !dateRegex.test(body.returnDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validar que las fechas sean válidas
    const departureDate = new Date(body.departureDate);
    const returnDate = new Date(body.returnDate);
    
    if (isNaN(departureDate.getTime()) || isNaN(returnDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid dates provided" },
        { status: 400 }
      );
    }
    
    // Validar que la fecha de regreso sea después de la de ida
    if (returnDate <= departureDate) {
      return NextResponse.json(
        { error: "Return date must be after departure date" },
        { status: 400 }
      );
    }

    // Validar que las fechas no sean en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departureDate < today) {
      return NextResponse.json(
        { error: "Departure date cannot be in the past" },
        { status: 400 }
      );
    }

    // Validar duración del viaje (mínimo 1 día, máximo 30 días)
    const tripDuration = Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (tripDuration < 1) {
      return NextResponse.json(
        { error: "Trip must be at least 1 day long" },
        { status: 400 }
      );
    }
    
    if (tripDuration > 30) {
      return NextResponse.json(
        { error: "Trip cannot be longer than 30 days" },
        { status: 400 }
      );
    }

    // Habitaciones
    if (!body.rooms || body.rooms < 1 || body.rooms > 5) {
      return NextResponse.json(
        { error: "Rooms must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Pasajeros
    if (!body.adults || body.adults < 1) {
      return NextResponse.json(
        { error: "At least 1 adult is required" },
        { status: 400 }
      );
    }

    if (body.adults > 20) {
      return NextResponse.json(
        { error: "Maximum 20 adults allowed" },
        { status: 400 }
      );
    }

    if (body.children < 0 || body.children > 10) {
      return NextResponse.json(
        { error: "Children must be between 0 and 10" },
        { status: 400 }
      );
    }

    console.log("✅ All validations passed");
    console.log("🔄 Starting worker...");

    // ========== EJECUTAR WORKER ==========
    const result = await runWorker(
      body.origin,
      body.destination,
      body.departureDate,
      body.returnDate,
      body.rooms,
      body.adults,
      body.children || 0
    );

    const totalTime = ((Date.now() - requestStartTime) / 1000).toFixed(2);
    console.log("=".repeat(60));
    console.log(`✅ Request completed successfully in ${totalTime} seconds`);
    console.log(`📦 Total packages found: ${result.total_encontrados}`);
    console.log(`✈️ Flights info: ${result.vuelos.ida.origen || 'N/A'} → ${result.vuelos.ida.destino || 'N/A'}`);
    console.log("=".repeat(60));

    // Agregar información de la petición al resultado
    const response = {
      ...result,
      request_info: {
        rooms: body.rooms,
        adults: body.adults,
        children: body.children,
        roomDetails: body.roomDetails,
      },
      processing_time: `${totalTime}s`,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    const totalTime = ((Date.now() - requestStartTime) / 1000).toFixed(2);
    
    console.error("=".repeat(60));
    console.error("❌ ERROR in quote after", totalTime, "seconds");
    console.error("Error details:", error);
    console.error("=".repeat(60));
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Determinar código de status apropiado
    let statusCode = 500;
    let userMessage = "Error processing quote";
    
    if (errorMessage.includes("No packages") || 
        errorMessage.includes("No se encontraron") ||
        errorMessage.includes("No valid JSON")) {
      statusCode = 404;
      userMessage = "No packages found for this search. Try different dates or destinations.";
    } else if (errorMessage.includes("Timeout") || 
               errorMessage.includes("tiempo máximo") || 
               errorMessage.includes("exceeded")) {
      statusCode = 408;
      userMessage = "The search took too long. Please try again or simplify your search.";
    } else if (errorMessage.includes("seleccionar") || 
               errorMessage.includes("origen") || 
               errorMessage.includes("destino")) {
      statusCode = 400;
      userMessage = "Invalid origin or destination. Please check your input.";
    } else if (errorMessage.includes("Invalid") || 
               errorMessage.includes("parsing")) {
      statusCode = 500;
      userMessage = "Error processing data from the travel site. Please try again.";
    } else if (errorMessage.includes("Worker failed")) {
      statusCode = 500;
      userMessage = "The search process failed. Please try again.";
    }
    
    return NextResponse.json(
      { 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        processing_time: `${totalTime}s`,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// Next.js configuration
export const maxDuration = 300; // 5 minutos en segundos
export const dynamic = 'force-dynamic';