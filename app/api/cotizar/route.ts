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
  };
  vuelos: {
    ida: {
      aerolinea: string;
      origen: string;
      hora_salida: string;
      tipo: string;
      destino: string;
      hora_llegada: string;
    };
    regreso: {
      aerolinea: string;
      origen: string;
      hora_salida: string;
      tipo: string;
      destino: string;
      hora_llegada: string;
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
}

async function runWorker(
  origen: string,
  destino: string,
  fechaIda: string,
  fechaVuelta: string,
  tipo: string
): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), "scripts/playwright_worker_price.py");

    console.log("=".repeat(60));
    console.log("Ejecutando worker:", {
      script: scriptPath,
      args: [origen, destino, fechaIda, fechaVuelta, tipo]
    });
    console.log("=".repeat(60));

    // Spawn del proceso Python
    const python = spawn("python3", [
      scriptPath,
      origen,
      destino,
      fechaIda,
      fechaVuelta,
      tipo
    ], {
      env: { ...process.env, OUTPUT_MODE: "api" },
      // Timeout de 4.5 minutos (270 segundos) - un poco menos que el timeout del cliente
      timeout: 270000
    });

    let outputData = "";
    let errorData = "";
    let workerStartTime = Date.now();

    python.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      console.log("Worker stdout:", text);
      outputData += text;
    });

    python.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      console.error("Worker stderr:", text);
      errorData += text;
    });

    python.on("close", (code) => {
      const elapsedTime = ((Date.now() - workerStartTime) / 1000).toFixed(2);
      console.log("=".repeat(60));
      console.log(`Worker terminó con código: ${code} en ${elapsedTime}s`);
      console.log("=".repeat(60));

      if (code !== 0) {
        console.error("Error output:", errorData);
        reject(new Error(`Worker falló con código ${code}: ${errorData}`));
        return;
      }

      try {
        // Buscar el JSON entre marcadores
        const jsonStartMatch = outputData.match(/__JSON_START__\s*(\{[\s\S]*?\})\s*__JSON_END__/);
        
        if (jsonStartMatch && jsonStartMatch[1]) {
          console.log("✓ JSON encontrado entre marcadores");
          const result = JSON.parse(jsonStartMatch[1]);
          
          // Validar estructura
          if (!result.paquetes || !Array.isArray(result.paquetes)) {
            reject(new Error("Estructura de datos inválida: falta campo 'paquetes'"));
            return;
          }
          
          if (result.paquetes.length === 0) {
            reject(new Error("No se encontraron paquetes disponibles"));
            return;
          }
          
          // Validar que los paquetes tengan precios válidos
          const paquetesValidos = result.paquetes.filter((p: any) => {
            return p.precio_persona && 
                   p.precio_persona !== "N/A" && 
                   p.precio_persona !== 0 &&
                   p.precio_persona !== "0";
          });
          
          if (paquetesValidos.length === 0) {
            console.error("❌ Ningún paquete tiene precios válidos");
            console.error("Paquetes recibidos:", JSON.stringify(result.paquetes.slice(0, 2), null, 2));
            reject(new Error("No se encontraron paquetes con precios válidos. Los datos pueden estar incompletos."));
            return;
          }
          
          if (paquetesValidos.length < result.paquetes.length) {
            console.warn(`⚠️ Solo ${paquetesValidos.length} de ${result.paquetes.length} paquetes tienen precios válidos`);
            // Usar solo los paquetes válidos
            result.paquetes = paquetesValidos;
            result.total_encontrados = paquetesValidos.length;
          }
          
          console.log(`✓ ${result.paquetes.length} paquetes válidos encontrados`);
          resolve(result);
        } else {
          // Fallback: buscar después de "=== RESULTADOS FINALES ==="
          console.log("Buscando JSON en output alternativo...");
          const jsonMatch = outputData.match(/=== RESULTADOS FINALES ===\s*(\{[\s\S]*\})/);
          
          if (jsonMatch && jsonMatch[1]) {
            console.log("✓ JSON encontrado en formato alternativo");
            const result = JSON.parse(jsonMatch[1]);
            
            if (!result.paquetes || result.paquetes.length === 0) {
              reject(new Error("No se encontraron paquetes disponibles"));
              return;
            }
            
            resolve(result);
          } else {
            console.error("Output completo recibido:");
            console.error(outputData.substring(0, 1000)); // Primeros 1000 caracteres
            reject(new Error("No se encontró JSON válido en la salida del worker"));
          }
        }
      } catch (e) {
        console.error("Error parseando JSON:", e);
        console.error("Output problemático:", outputData.substring(0, 500));
        reject(new Error(`Error parseando resultado: ${e}`));
      }
    });

    python.on("error", (err) => {
      console.error("Error spawning python:", err);
      reject(new Error(`Error al ejecutar worker: ${err.message}`));
    });

    // Timeout manual adicional por si el spawn timeout no funciona
    const manualTimeout = setTimeout(() => {
      console.error("⏰ Timeout manual activado - matando proceso worker");
      python.kill('SIGTERM');
      reject(new Error("El worker excedió el tiempo máximo de ejecución (4.5 minutos)"));
    }, 270000);

    // Limpiar timeout si termina antes
    python.on("close", () => {
      clearTimeout(manualTimeout);
    });
  });
}

export async function POST(req: Request) {
  try {
    const body: CotizarRequest = await req.json();

    console.log("=".repeat(60));
    console.log("Solicitud recibida en:", new Date().toISOString());
    console.log("Datos:", JSON.stringify(body, null, 2));
    console.log("=".repeat(60));

    // Validaciones
    if (!body.origin || !body.destination) {
      return NextResponse.json(
        { error: "Origen y destino son requeridos" },
        { status: 400 }
      );
    }

    if (!body.departureDate || !body.returnDate) {
      return NextResponse.json(
        { error: "Fechas de ida y vuelta son requeridas" },
        { status: 400 }
      );
    }

    // Validar formato de fechas (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.departureDate) || !dateRegex.test(body.returnDate)) {
      return NextResponse.json(
        { error: "Formato de fecha inválido. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validar que la fecha de vuelta sea después de la fecha de ida
    const departureDate = new Date(body.departureDate);
    const returnDate = new Date(body.returnDate);
    
    if (returnDate <= departureDate) {
      return NextResponse.json(
        { error: "La fecha de vuelta debe ser posterior a la fecha de ida" },
        { status: 400 }
      );
    }

    console.log("✓ Validaciones pasadas, iniciando worker...");
    const startTime = Date.now();

    // Ejecutar worker
    const result = await runWorker(
      body.origin,
      body.destination,
      body.departureDate,
      body.returnDate,
      body.packageType || "PAQUETE"
    );

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("=".repeat(60));
    console.log(`✓ Worker completado exitosamente en ${elapsedTime} segundos`);
    console.log(`✓ Total de paquetes: ${result.total_encontrados}`);
    console.log("=".repeat(60));

    // Agregar información de la solicitud al resultado
    const response = {
      ...result,
      request_info: {
        rooms: body.rooms,
        adults: body.adults,
        children: body.children,
        roomDetails: body.roomDetails,
      },
      processing_time: `${elapsedTime}s`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("=".repeat(60));
    console.error("❌ ERROR en cotización:", error);
    console.error("=".repeat(60));
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Determinar código de estado apropiado
    let statusCode = 500;
    if (errorMessage.includes("No se encontraron paquetes")) {
      statusCode = 404;
    } else if (errorMessage.includes("Timeout") || errorMessage.includes("tiempo máximo")) {
      statusCode = 408; // Request Timeout
    }
    
    return NextResponse.json(
      { 
        error: "Error al procesar cotización",
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}

// Configuración de Next.js para aumentar el tiempo de ejecución
export const maxDuration = 300; // 5 minutos en segundos
export const dynamic = 'force-dynamic';