"use client";
import Link from "next/link";
import Image from "next/image";
import {
  HomeModernIcon,
  GlobeAmericasIcon,
  StarIcon,
  FilmIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Montserrat } from "next/font/google";

// Fuente moderna y clara
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Navbar() {
  return (
    <nav className="sticky top-0 bg-gradient-to-r from-[#f4a261]/90 via-[#ffc75f]/80 to-[#e67e22]/90 backdrop-blur-md shadow-md z-50 py-2">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 text-white">
        
        {/* Logo a la izquierda */}
        <div className="flex items-center gap-2">
          <Image
            src="/3enrutalogo.png"
            alt="Logo Tres en Ruta"
            width={130}
            height={30}
            priority
          />
        </div>

        {/* Links centrados con íconos y fuente */}
        <div className={`flex space-x-12 text-lg font-semibold ${montserrat.className}`}>
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors"
          >
            <HomeModernIcon className="h-5 w-5 text-white" />
            <span className="text-white">Home</span>
          </Link>
          <Link
            href="/tours"
            className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors"
          >
            <GlobeAmericasIcon className="h-5 w-5 text-white" />
            <span className="text-white">Tours</span>
          </Link>
          <Link
            href="/rewards"
            className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors"
          >
            <StarIcon className="h-5 w-5 text-white" />
            <span className="text-white">Recompensas</span>
          </Link>
          <Link
            href="/videos"
            className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors"
          >
            <FilmIcon className="h-5 w-5 text-white" />
            <span className="text-white">Videos</span>
          </Link>
        </div>

        {/* Botón login con ícono */}
        <Link
          href="/login"
          className="flex items-center gap-2 bg-white text-[#e67e22] px-4 py-1 rounded-md font-semibold hover:bg-[#ffc75f]/90 transition-colors"
        >
          <UserIcon className="h-5 w-5" />
          Iniciar Sesión
        </Link>
      </div>
    </nav>
  );
}
