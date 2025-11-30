"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <nav className="sticky top-0 bg-gradient-to-r from-orange-500/80 via-yellow-600/80 to-amber-700/80 backdrop-blur-md shadow-md z-50 py-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-6 text-white">
        {/* Logo a la izquierda */}
        <h1 className="font-extrabold text-3xl tracking-wide">Tres en Ruta</h1>

        {/* Links centrados */}
        <div className="flex space-x-8 text-lg font-bold">
          <Link href="/" className="hover:text-gray-200 transition-colors">
            Home
          </Link>
          <Link href="/tours" className="hover:text-gray-200 transition-colors">
            Tours
          </Link>
          <Link href="/rewards" className="hover:text-gray-200 transition-colors">
            Recompensas
          </Link>
          <Link href="/videos" className="hover:text-gray-200 transition-colors">
            Videos
          </Link>
        </div>

        {/* Botón login con ícono */}
        <Link
          href="/login"
          className="flex items-center gap-2 bg-white/90 text-orange-600 px-4 py-1 rounded-md font-semibold hover:bg-white transition-colors"
        >
          <UserIcon className="h-5 w-5" />
          Iniciar Sesión
        </Link>
      </div>
    </nav>
  );
}
