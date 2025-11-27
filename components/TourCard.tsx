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
    <div className="bg-white border rounded-lg shadow-md w-40 hover:shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden">
      <img
        src={imagen}
        alt={nombre}
        className="w-full h-16 object-cover"
      />
      <div className="p-2">
        <h3 className="text-sm font-bold text-gray-800 text-center">{nombre}</h3>
        <p className="text-xs text-gray-500 text-center">{destino}</p>
        <p className="mt-1 text-xs text-gray-700 line-clamp-2">{descripcion}</p>
        <p className="mt-2 text-sm font-semibold text-orange-600 text-center">
          ${precio.toLocaleString()}
        </p>
        {fecha_inicio && fecha_fin && (
          <p className="text-xs text-gray-500 mt-1 text-center">
            {fecha_inicio} - {fecha_fin}
          </p>
        )}
        {tipo && (
          <span className="block mt-2 mx-auto px-2 py-0.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-full w-fit">
            {tipo}
          </span>
        )}
      </div>
    </div>
  );
}
