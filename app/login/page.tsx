"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useUser } from "@/context/UserContext"; // 👈 importa el contexto

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser(); // 👈 obtenemos setUser del contexto
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Error al iniciar sesión.");
        setLoading(false);
        return;
      }

      // 🔑 Guardar usuario en localStorage y actualizar contexto
      localStorage.setItem("loggedUser", JSON.stringify(data.user));
      setUser(data.user); // 👈 dispara el re-render inmediato del Navbar

      // 🔄 Forzar refresh para que Navbar se actualice sin recargar manualmente
      router.push("/profile");
      router.refresh(); // 👈 refresca el estado de la app
      // Si prefieres un reload completo: window.location.reload();
    } catch (error) {
      console.error("Error en login:", error);
      alert("Hubo un problema al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4a261]">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Tarjeta de Login */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold text-[#e76f51] mb-6 text-center">
            Bienvenido de nuevo
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Inicia sesión para acceder a tus recompensas y viajes personalizados
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuario */}
            <div className="flex items-center border rounded-lg p-3 bg-gray-50">
              <UserIcon className="h-5 w-5 text-[#a8bb5c] mr-2" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="flex items-center border rounded-lg p-3 bg-gray-50">
              <LockClosedIcon className="h-5 w-5 text-[#a8bb5c] mr-2" />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e76f51] text-white font-semibold py-3 rounded-lg hover:bg-[#d65a3a] transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Link de registro */}
          <p className="text-center text-sm text-gray-600 mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[#ffc75f] font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Imagen a la derecha */}
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1613518879826-3133310d9f78?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0"
            alt="Login background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
