"use client";
import React, { useState, useEffect } from "react";

const ofertas = [
  {
    titulo: "Vuelo + Hotel Cancún",
    descripcion: "Paquete todo incluido con descuentos especiales",
    imagen: "https://images.unsplash.com/photo-1620095198790-2f663d67677d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    titulo: "Tours de Temporada CDMX",
    descripcion: "Explora la capital con visitas guiadas únicas",
    imagen: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    titulo: "Escapada a Oaxaca",
    descripcion: "Cultura, gastronomía y artesanías con recompensas",
    imagen: "https://images.unsplash.com/photo-1654235648212-e06309196953?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
];

export default function OffersCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ofertas.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-full mx-auto h-[60vh]">
      <div className="overflow-hidden rounded-xl shadow-lg h-full relative">
        <img
          src={ofertas[index].imagen}
          alt={ofertas[index].titulo}
          className="w-full h-full object-cover"
        />

        {/* Texto centrado en medio */}
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif tracking-wide text-white mb-4 drop-shadow-lg">
            {ofertas[index].titulo}
          </h2>
          <p className="text-lg md:text-xl font-medium text-orange-100 max-w-2xl">
            {ofertas[index].descripcion}
          </p>
        </div>
      </div>

      {/* Indicadores circulares */}
      <div className="flex justify-center mt-4 gap-3">
        {ofertas.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-4 h-4 rounded-full transition-all ${
              i === index ? "bg-orange-500 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
