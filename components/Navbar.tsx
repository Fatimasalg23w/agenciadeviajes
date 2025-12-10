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
import { useState, useEffect, useRef } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Cargar usuario tras hidratar y mantener sincronizado si cambia localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("loggedUser");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    // Escuchar cambios de localStorage desde otras pestañas o acciones (logout/login)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "loggedUser") loadUser();
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setUser(null);
    setOpen(false);
    window.location.href = "/"; // redirigir al home
  };

  // Nombre seguro: intenta nombre, name, o el email como fallback
  const displayName =
    (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.nombre) ||
    user?.name ||
    user?.email ||
    "Tu cuenta";

  return (
    <nav className="sticky top-0 bg-gradient-to-r from-[#f4a261]/90 via-[#ffc75f]/80 to-[#e67e22]/90 backdrop-blur-md shadow-md z-50 py-2">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 text-white">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/3enrutalogo.png"
            alt="Logo Tres en Ruta"
            width={130}
            height={30}
            priority
          />
        </div>

        {/* Links */}
        <div className={`flex space-x-12 text-lg font-semibold ${montserrat.className}`}>
          <Link href="/" className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors">
            <HomeModernIcon className="h-5 w-5 text-white" />
            <span className="text-white">Home</span>
          </Link>
          <Link href="/tours" className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors">
            <GlobeAmericasIcon className="h-5 w-5 text-white" />
            <span className="text-white">Tours</span>
          </Link>
          <Link href="/rewards" className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors">
            <StarIcon className="h-5 w-5 text-white" />
            <span className="text-white">Recompensas</span>
          </Link>
          <Link href="/videos" className="flex items-center gap-2 hover:text-[#a8bb5c] transition-colors">
            <FilmIcon className="h-5 w-5 text-white" />
            <span className="text-white">Videos</span>
          </Link>
        </div>

        {/* Login o usuario */}
        {!user ? (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-white text-[#e67e22] px-4 py-1 rounded-md font-semibold hover:bg-[#ffc75f]/90 transition-colors"
          >
            <UserIcon className="h-5 w-5" />
            Iniciar Sesión
          </Link>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 bg-white text-[#e67e22] px-4 py-1 rounded-md font-semibold"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <UserIcon className="h-5 w-5" />
              <span className="truncate max-w-[12rem]">{displayName}</span>
              <svg
                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
              </svg>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white text-black rounded shadow-lg overflow-hidden"
              >
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                  Perfil
                </Link>
                <Link href="/profile?tab=reservas" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                  Mis viajes
                </Link>
                <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                  Configuración
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

