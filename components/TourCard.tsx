import React from "react";

interface TourCardProps {
  nombre: string;
  destino: string;
  descripcion: string;
  precio: number;
  imagen: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo?: string;
}

export default function TourCard({
  nombre,
  destino,
  descripcion,
  precio,
  imagen,
  fecha_inicio,
  fecha_fin,
  tipo,
}: TourCardProps) {
  return (
    <div className="bg-white border rounded-xl shadow-md w-full max-w-sm hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
      <img
        src={imagen}
        alt={nombre}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 text-center">{nombre}</h3>
        <p className="text-sm text-gray-500 text-center">{destino}</p>
        <p className="mt-2 text-sm text-gray-700 line-clamp-2 text-center">{descripcion}</p>
        <p className="mt-3 text-base font-semibold text-orange-600 text-center">
          ${precio.toLocaleString()}
        </p>
        {fecha_inicio && fecha_fin && (
          <p className="text-sm text-gray-500 mt-1 text-center">
            {fecha_inicio} - {fecha_fin}
          </p>
        )}
        {tipo && (
          <span className="block mt-3 mx-auto px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-full w-fit">
            {tipo}
          </span>
        )}
      </div>
    </div>
  );
}
