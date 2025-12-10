"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pendingUser, setPendingUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("pendingUser");
    if (storedUser) {
      setPendingUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pendingUser) {
      alert("No se encontraron datos de registro. Regístrate nuevamente.");
      router.push("/register");
      return;
    }

    // Comparar código ingresado con el guardado en localStorage
    if (code !== pendingUser.code) {
      alert("Código incorrecto ❌");
      localStorage.removeItem("pendingUser");
      router.push("/register");
      return;
    }

    try {
      // Quitamos el campo code antes de enviar al backend
      const { code: _, ...userData } = pendingUser;

      const res = await fetch("/api/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          status: "verified", // se guarda ya verificado
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("pendingUser"); // limpiar datos temporales
        alert("✅ Perfil guardado. Ahora puedes iniciar sesión.");
        router.push("/login");
      } else {
        alert(data.message || "No se pudo crear el usuario.");
      }
    } catch (error) {
      console.error("Error en verificación:", error);
      alert("Hubo un problema al verificar. Intenta de nuevo.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#a8bb5c]">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <CheckBadgeIcon className="h-8 w-8 text-[#d35400] mr-2" />
          <h1 className="text-2xl font-bold text-white bg-[#556B2F] px-4 py-1 rounded-lg">
            Verificación de Código
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Ingresa el código recibido"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border rounded-lg p-2 text-[#556B2F] focus:outline-none focus:ring-2 focus:ring-[#d35400]"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#556B2F] text-white font-semibold py-2 rounded-lg hover:bg-[#445522] transition-colors"
          >
            Verificar
          </button>
        </form>

        <p className="text-center text-sm text-[#556B2F] mt-4">
          ¿No recibiste el código?{" "}
          <span
            className="underline cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Reenviar
          </span>
        </p>
      </div>
    </main>
  );
}
