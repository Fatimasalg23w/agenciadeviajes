"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("No se encontró el correo del usuario. Regístrate nuevamente.");
      router.push("/register");
      return;
    }

    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    if (data.success) {
      router.push("/register/verified");
    } else {
      alert(data.message || "Código incorrecto ❌");
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
          <span className="underline cursor-pointer">Reenviar</span>
        </p>
      </div>
    </main>
  );
}
