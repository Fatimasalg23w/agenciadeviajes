"use client";
import React from "react";

export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-100 to-amber-200 text-gray-800">
      <section className="max-w-5xl mx-auto px-6 py-12">
        {/* Título */}
        <h1 className="text-4xl font-extrabold text-orange-600 mb-6">
          Tu experiencia con Tres en Ruta
        </h1>
        <p className="text-lg leading-relaxed mb-10">
          Nuestro proceso está diseñado para que disfrutes cada paso de tu viaje, 
          desde la primera cotización hasta la confirmación final de tu itinerario. 
          Además, ofrecemos servicios únicos para que tus momentos más importantes 
          se conviertan en recuerdos inolvidables.
        </p>

        {/* Pasos del proceso */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">🔑</span>
            <p className="font-semibold">Login / Registro</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">💰</span>
            <p className="font-semibold">Cotiza tu viaje</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">📅</span>
            <p className="font-semibold">Reserva automática</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">💳</span>
            <p className="font-semibold">Pago seguro</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">🎁</span>
            <p className="font-semibold">Obtienes puntos + itinerario</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">🎥</span>
            <p className="font-semibold">Videollamada a los 3 días</p>
            <p className="text-sm text-gray-600 mt-2">
              Confirmamos tu itinerario y resolvemos dudas
            </p>
          </div>
        </div>

        {/* Ejemplo de recompensas */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-200 text-center mb-12">
          <h3 className="text-xl font-bold text-orange-600 mb-4">
            Ejemplo de recompensa
          </h3>
          <p className="text-lg">
            Si inviertes <span className="font-bold">$1,000 dólares</span> en tu viaje, 
            acumularás beneficios que podrás usar en tu próxima aventura con nosotros.
          </p>
        </div>

        {/* Servicios especiales */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-amber-300">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            Servicios y viajes especiales
          </h2>
          <p className="text-lg mb-4">
            Creamos experiencias a la medida para tus momentos más importantes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>💍 Propuestas de matrimonio inolvidables</li>
            <li>👰 Bodas con escenarios únicos</li>
            <li>🎉 Fiestas y celebraciones personalizadas</li>
            <li>🌎 Viajes diseñados especialmente para ti</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
