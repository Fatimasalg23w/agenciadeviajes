import React from "react";

interface TourCardProps {
  nombre: string;
  destinos?: string[]; // Ahora es un array de destinos
  descripcion?: string;
  costoTotal?: number; // Cambiado de precio a costoTotal
  imagenes?: string[]; // Ahora es un array de imágenes
  fechas?: {
    inicio: string;
    fin: string;
  };
  dias?: Array<{
    numero: number;
    actividad: string;
    costo?: number;
  }>;
  costoVuelo?: number;
}

export default function TourCard({
  nombre,
  destinos,
  descripcion,
  costoTotal,
  imagenes,
  fechas,
  dias,
  costoVuelo,
}: TourCardProps) {
  // Obtener la primera imagen del array
  const imagen = imagenes && imagenes.length > 0 ? imagenes[0] : undefined;
  
  // Formatear los destinos como string
  const destinosText = destinos && destinos.length > 0 
    ? destinos.join(" • ") 
    : undefined;
  
  // Formatear las fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fechaInicio = fechas?.inicio ? formatDate(fechas.inicio) : undefined;
  const fechaFin = fechas?.fin ? formatDate(fechas.fin) : undefined;

  // Calcular duración del tour
  const duracion = dias ? `${dias.length} días` : undefined;

  return (
    <div className="bg-white border rounded-xl shadow-md w-full max-w-sm hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
      {imagen ? (
        <img
          src={imagen}
          alt={nombre}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          Sin imagen
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 text-center">{nombre}</h3>
        
        {destinosText && (
          <p className="text-sm text-gray-500 text-center mt-1">{destinosText}</p>
        )}
        
        {descripcion && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-2 text-center">
            {descripcion}
          </p>
        )}
        
        {duracion && (
          <p className="text-xs text-gray-600 text-center mt-2 font-medium">
            {duracion}
          </p>
        )}
        
        {fechaInicio && fechaFin && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            {fechaInicio} – {fechaFin}
          </p>
        )}
        
        <div className="mt-3 border-t pt-3">
          {costoVuelo !== undefined && (
            <p className="text-xs text-gray-600 text-center">
              Vuelo: ${costoVuelo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          )}
          
          {costoTotal !== undefined && (
            <p className="mt-1 text-lg font-bold text-orange-600 text-center">
              Total: ${costoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        <button className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all duration-300">
          Ver detalles
        </button>
      </div>
    </div>
  );
}