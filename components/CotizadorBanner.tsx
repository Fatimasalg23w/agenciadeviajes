"use client";
import React, { useState } from "react";
import { MapPinIcon, CalendarDaysIcon, UserIcon } from "@heroicons/react/24/outline";

export default function CotizadorBanner() {
  const [tab, setTab] = useState<"vueloHotel" | "tours">("vueloHotel");

  return (
    <div className="w-full bg-orange-700 shadow-lg py-10">
      {/* Intro + Pestañas en una fila */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 mb-8 border-b border-orange-800">
        {/* Texto introductorio */}
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-wide mb-2">
            Aquí te ayudamos a reservar todo
          </h2>
          <p className="text-lg md:text-xl font-medium text-orange-100">
            Con actividades o solo tu vuelo y hotel. Selecciona la opción:
          </p>
        </div>

        {/* Pestañas estilo navegador */}
        <div className="flex gap-2">
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold transition-colors ${
              tab === "vueloHotel"
                ? "bg-white text-orange-700 shadow-md border border-orange-800 border-b-0"
                : "bg-orange-600 text-white hover:bg-orange-500"
            }`}
            onClick={() => setTab("vueloHotel")}
          >
            Vuelo + Hotel
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold transition-colors ${
              tab === "tours"
                ? "bg-white text-orange-700 shadow-md border border-orange-800 border-b-0"
                : "bg-orange-600 text-white hover:bg-orange-500"
            }`}
            onClick={() => setTab("tours")}
          >
            Tours + Vuelo + Hotel
          </button>
        </div>
      </div>

      {/* Barra estilo buscador */}
      {tab === "vueloHotel" && (
        <div className="flex flex-col md:flex-row items-center gap-4 px-6">
          {/* Origen */}
          <div className="flex items-center border rounded-lg p-2 flex-1 bg-white">
            <MapPinIcon className="h-5 w-5 text-orange-700 mr-2" />
            <input type="text" placeholder="Origen" className="flex-1 outline-none" />
          </div>

          {/* Destino */}
          <div className="flex items-center border rounded-lg p-2 flex-1 bg-white">
            <MapPinIcon className="h-5 w-5 text-orange-700 mr-2" />
            <input type="text" placeholder="Destino" className="flex-1 outline-none" />
          </div>

          {/* Fecha ida */}
          <div className="flex items-center border rounded-lg p-2 flex-1 bg-white">
            <CalendarDaysIcon className="h-5 w-5 text-orange-700 mr-2" />
            <input type="date" className="flex-1 outline-none" />
          </div>

          {/* Fecha vuelta */}
          <div className="flex items-center border rounded-lg p-2 flex-1 bg-white">
            <CalendarDaysIcon className="h-5 w-5 text-orange-700 mr-2" />
            <input type="date" className="flex-1 outline-none" />
          </div>

          {/* Pasajeros compacto horizontal */}
          <div className="flex items-center border rounded-lg p-2 w-48 bg-white">
            <UserIcon className="h-5 w-5 text-orange-700 mr-2" />
            <div className="flex gap-2 w-full">
              <select className="flex-1 border rounded-lg p-1 text-sm" defaultValue="1">
                <option value="1">1 adulto</option>
                <option value="2">2 adultos</option>
              </select>
              <select className="flex-1 border rounded-lg p-1 text-sm" defaultValue="0">
                <option value="0">0 niños</option>
                <option value="1">1 niño</option>
                <option value="2">2 niños</option>
              </select>
            </div>
          </div>

          {/* Botón Buscar */}
          <button
            className="bg-white text-orange-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => window.open("https://www.despegar.com", "_blank")}
          >
            Buscar
          </button>
        </div>
      )}

      {tab === "tours" && (
        <div className="flex flex-col md:flex-row items-center gap-4 px-6">
          <select className="flex-1 border rounded-lg p-2 bg-white">
            <option value="">Selecciona mes</option>
            <option value="enero">Enero</option>
            <option value="febrero">Febrero</option>
            <option value="marzo">Marzo</option>
          </select>
          <select className="flex-1 border rounded-lg p-2 bg-white">
            <option value="">Selecciona destino</option>
            <option value="cdmx">Ciudad de México</option>
            <option value="cancun">Cancún</option>
            <option value="oaxaca">Oaxaca</option>
          </select>
          <button className="bg-white text-orange-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Cotizar Tour
          </button>
        </div>
      )}
    </div>
  );
}
