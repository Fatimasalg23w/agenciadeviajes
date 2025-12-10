"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon,
  BuildingOfficeIcon,
  StarIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface Vuelo {
  aerolinea: string;
  origen: string;
  hora_salida: string;
  tipo: string;
  destino: string;
  hora_llegada: string;
}

interface Paquete {
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
}

interface Resultados {
  busqueda: {
    origen: string;
    destino: string;
    fecha_ida: string;
    fecha_vuelta: string;
  };
  vuelos: {
    ida: Vuelo;
    regreso: Vuelo;
  };
  paquetes: Paquete[];
  total_encontrados: number;
  request_info?: {
    rooms: number;
    adults: number;
    children: number;
  };
}

export default function ResultadosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultados | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Refs para evitar múltiples llamadas
  const fetchInitiated = useRef(false);

  const processSteps = [
    "🔍 Searching best options for you...",
    "✈️ Analyzing flight routes and schedules...",
    "🏨 Comparing hotel availability and prices...",
    "💰 Finding the best deals for your dates...",
    "📊 Processing package combinations...",
    "🎯 Filtering by your preferences...",
    "✨ Optimizing your travel experience...",
    "📋 Preparing your personalized results...",
    "🎉 Almost ready! Final touches...",
  ];

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    // Evitar múltiples llamadas
    if (fetchInitiated.current) {
      addDebugLog("⚠️ Fetch ya fue iniciado, evitando duplicado");
      return;
    }

    fetchInitiated.current = true;
    addDebugLog("🚀 Iniciando proceso de cotización");

    const fetchResults = async () => {
      let timeInterval: NodeJS.Timeout | undefined;
      let messageInterval: NodeJS.Timeout | undefined;
      let timeoutHandle: NodeJS.Timeout | undefined;
      let fetchAborted = false;

      try {
        // Obtener datos de cotización
        const quoteData = localStorage.getItem("lastQuote");
        
        if (!quoteData) {
          addDebugLog("❌ No hay datos en localStorage");
          setError("No hay datos de cotización. Por favor realiza una búsqueda.");
          setLoading(false);
          return;
        }

        const quote = JSON.parse(quoteData);
        addDebugLog(`📋 Datos de cotización: ${quote.origin} → ${quote.destination}`);
        addDebugLog(`📅 Fechas: ${quote.departureDate} → ${quote.returnDate}`);

        // Iniciar contador de tiempo
        const startTime = Date.now();
        timeInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setElapsedTime(elapsed);
        }, 1000);

        // Ciclo de mensajes cada 10 segundos
        messageInterval = setInterval(() => {
          setCurrentStep((prev) => (prev + 1) % processSteps.length);
        }, 10000);

        addDebugLog("🌐 Iniciando llamada a API...");
        addDebugLog("⏱️ Timeout configurado: 5 minutos");

        // Crear AbortController
        const controller = new AbortController();

        // Configurar timeout de 5 minutos
        timeoutHandle = setTimeout(() => {
          addDebugLog("⏰ Timeout de 5 minutos alcanzado - Abortando fetch");
          fetchAborted = true;
          controller.abort();
        }, 300000); // 5 minutos = 300,000 ms

        // Realizar fetch
        const response = await fetch("/api/cotizar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quote),
          signal: controller.signal,
        }).catch((err) => {
          if (err.name === 'AbortError') {
            addDebugLog("❌ Fetch abortado por timeout");
            throw new Error("TIMEOUT");
          }
          addDebugLog(`❌ Error en fetch: ${err.message}`);
          throw err;
        });

        // Si llegamos aquí, la respuesta llegó antes del timeout
        clearTimeout(timeoutHandle);
        clearInterval(timeInterval);
        clearInterval(messageInterval);

        const apiElapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        addDebugLog(`✅ API respondió en ${apiElapsedTime} segundos`);
        addDebugLog(`📊 Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            details: `Error ${response.status}: ${response.statusText}` 
          }));
          addDebugLog(`❌ Error de API: ${errorData.details}`);
          throw new Error(errorData.details || "Error al obtener resultados");
        }

        addDebugLog("📦 Parseando respuesta JSON...");
        const data: Resultados = await response.json();
        
        addDebugLog(`✅ JSON parseado exitosamente`);
        addDebugLog(`📊 Paquetes recibidos: ${data.paquetes?.length || 0}`);
        
        // Validar estructura de datos
        if (!data) {
          addDebugLog("❌ Respuesta vacía del servidor");
          throw new Error("No se recibieron datos del servidor");
        }

        if (!data.paquetes) {
          addDebugLog("❌ La respuesta no contiene campo 'paquetes'");
          throw new Error("La respuesta no contiene paquetes");
        }

        if (!Array.isArray(data.paquetes)) {
          addDebugLog("❌ El campo 'paquetes' no es un array");
          throw new Error("Formato de datos inválido");
        }

        if (data.paquetes.length === 0) {
          addDebugLog("⚠️ No se encontraron paquetes disponibles");
          throw new Error("No se encontraron paquetes disponibles para estas fechas");
        }
        
        // Mostrar último mensaje antes de mostrar resultados
        setCurrentStep(processSteps.length - 1);
        addDebugLog("🎉 Preparando visualización de resultados...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        addDebugLog("✅ Mostrando resultados al usuario");
        setResultados(data);
        setLoading(false);

      } catch (err) {
        // Limpiar todos los timers
        if (timeoutHandle) clearTimeout(timeoutHandle);
        if (timeInterval) clearInterval(timeInterval);
        if (messageInterval) clearInterval(messageInterval);
        
        addDebugLog("❌ ERROR CAPTURADO");
        
        if (err instanceof Error) {
          addDebugLog(`❌ Tipo de error: ${err.name}`);
          addDebugLog(`❌ Mensaje: ${err.message}`);
          
          if (err.message === "TIMEOUT" || err.name === 'AbortError') {
            setError(
              "La búsqueda tomó más de 5 minutos. " +
              "Esto puede deberse a que nuestro servicio está tardando en responder. " +
              "Por favor intenta de nuevo o prueba con fechas diferentes."
            );
          } else if (err.message.includes('fetch')) {
            setError(
              "Error de conexión con el servidor. " +
              "Por favor verifica tu conexión a internet y vuelve a intentar."
            );
          } else {
            setError(err.message);
          }
        } else {
          addDebugLog("❌ Error desconocido");
          setError("Error desconocido al procesar la búsqueda");
        }
        
        setLoading(false);
      }
    };

    fetchResults();
  }, []); // Array de dependencias vacío - solo se ejecuta al montar

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseInt(price) : price;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(num);
  };

  const renderStars = (estrellas: string) => {
    const num = parseInt(estrellas) || 0;
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          i < num ? (
            <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  if (loading) {
    const maxTime = 300; // 5 minutos en segundos
    const progress = Math.min((elapsedTime / maxTime) * 100, 98);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#556B2F] to-[#a8bb5c] p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#556B2F] mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">✈️</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Finding Your Perfect Trip
          </h2>
          
          <div className="text-center text-sm text-gray-600 mb-6">
            <span className="text-gray-500">Elapsed time:</span>{" "}
            <span className="font-mono font-bold text-lg text-[#556B2F]">
              {formatTime(elapsedTime)}
            </span>
            <span className="text-gray-500"> / 5:00</span>
          </div>
          
          <div className="bg-gradient-to-r from-[#f0f4e8] to-[#e8f0e8] rounded-lg p-6 mb-6 min-h-[100px] flex items-center justify-center border-2 border-[#a8bb5c]/30">
            <p className="text-lg text-center text-gray-700 animate-pulse font-semibold">
              {processSteps[currentStep]}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span className="font-semibold">Processing your request...</span>
              <span className="font-mono font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#556B2F] via-[#6d8b3a] to-[#a8bb5c] h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {["Connecting to our database", "Searching flights", "Finding hotels", "Comparing prices", "Building packages"].map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  elapsedTime > (index * 60) 
                    ? 'bg-green-50 border-l-4 border-green-500' 
                    : 'bg-gray-50 opacity-50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  elapsedTime > (index * 60)
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {elapsedTime > (index * 60) ? '✓' : index + 1}
                </div>
                <p className="text-sm text-gray-700 flex-1">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Please wait:</strong> This process can take up to 5 minutes. 
              We&apos;re searching through thousands of packages to find the best deals for you.
            </p>
          </div>
          
          {elapsedTime > 150 && elapsedTime < 300 && (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded animate-pulse">
              <p className="text-sm text-yellow-800 font-semibold">
                ⏳ Taking longer than usual... Still searching for the best options!
              </p>
            </div>
          )}

          {elapsedTime > 240 && (
            <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
              <p className="text-sm text-orange-800 font-semibold">
                ⏰ Almost there! Just a few more seconds...
              </p>
            </div>
          )}

          {/* Debug logs - solo visible en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-semibold">
                🔧 Debug Logs ({debugLogs.length})
              </summary>
              <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                {debugLogs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          
          {/* Debug logs en error */}
          {debugLogs.length > 0 && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-semibold">
                🔧 Ver logs de depuración ({debugLogs.length})
              </summary>
              <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-60 overflow-y-auto text-left">
                {debugLogs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))}
              </div>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                addDebugLog("🔄 Usuario solicitó nueva búsqueda");
                router.push("/");
              }}
              className="bg-[#556B2F] text-white px-6 py-3 rounded-lg hover:bg-[#445522] font-semibold transition-colors"
            >
              Nueva búsqueda
            </button>
            <button
              onClick={() => {
                addDebugLog("🔄 Usuario solicitó reintentar");
                window.location.reload();
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!resultados || !resultados.paquetes || resultados.paquetes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-gray-400 text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin resultados</h2>
          <p className="text-gray-600 mb-4">No se encontraron paquetes disponibles para tu búsqueda.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#556B2F] text-white px-6 py-2 rounded-lg hover:bg-[#445522]"
          >
            Nueva búsqueda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#556B2F] text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">
            Resultados: {resultados.busqueda.origen} → {resultados.busqueda.destino}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>
                {new Date(resultados.busqueda.fecha_ida).toLocaleDateString("es-MX")} - {" "}
                {new Date(resultados.busqueda.fecha_vuelta).toLocaleDateString("es-MX")}
              </span>
            </div>
            {resultados.request_info && (
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5" />
                <span>
                  {resultados.request_info.adults} adultos, {resultados.request_info.children} niños, {" "}
                  {resultados.request_info.rooms} habitación(es)
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5" />
              <span>{resultados.total_encontrados} paquetes encontrados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">✈️ Vuelo Recomendado</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-700 mb-2">Ida</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {resultados.vuelos.ida.hora_salida || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">{resultados.vuelos.ida.origen || "N/A"}</div>
                </div>
                <div className="flex flex-col items-center px-4">
                  <div className="text-xs text-gray-500">{resultados.vuelos.ida.tipo || "Directo"}</div>
                  <ArrowRightIcon className="h-6 w-6 text-gray-400 my-1" />
                  <div className="text-xs text-gray-500">
                    {resultados.vuelos.ida.aerolinea || "Aerolínea"}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {resultados.vuelos.ida.hora_llegada || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">{resultados.vuelos.ida.destino || "N/A"}</div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-700 mb-2">Regreso</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {resultados.vuelos.regreso.hora_salida || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">{resultados.vuelos.regreso.origen || "N/A"}</div>
                </div>
                <div className="flex flex-col items-center px-4">
                  <div className="text-xs text-gray-500">{resultados.vuelos.regreso.tipo || "Directo"}</div>
                  <ArrowRightIcon className="h-6 w-6 text-gray-400 my-1" />
                  <div className="text-xs text-gray-500">
                    {resultados.vuelos.regreso.aerolinea || "Aerolínea"}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {resultados.vuelos.regreso.hora_llegada || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">{resultados.vuelos.regreso.destino || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">🏨 Paquetes Disponibles</h2>
        <div className="grid gap-6">
          {resultados.paquetes.map((paquete, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img
                    src={paquete.imagen || "/placeholder-hotel.jpg"}
                    alt={paquete.hotel_name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {paquete.hotel_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{paquete.ciudad}</span>
                      </div>
                    </div>
                    {paquete.descuento && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {paquete.descuento}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    {renderStars(paquete.estrellas)}
                    {paquete.calificacion !== "N/A" && (
                      <div className="flex items-center gap-1">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                          {paquete.calificacion}
                        </span>
                        {paquete.opiniones !== "N/A" && (
                          <span className="text-xs text-gray-500">{paquete.opiniones}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {paquete.plan_alimentos}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      {paquete.precio_original && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(paquete.precio_original)}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">Por persona</div>
                      <div className="text-3xl font-bold text-[#556B2F]">
                        {formatPrice(paquete.precio_persona)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Total: <span className="font-semibold">{formatPrice(paquete.precio_total)}</span>
                      </div>
                    </div>
                    <a
                      href={paquete.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#556B2F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#445522] transition-colors"
                    >
                      Ver detalles
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Nueva búsqueda
          </button>
        </div>
      </div>
    </div>
  );
}