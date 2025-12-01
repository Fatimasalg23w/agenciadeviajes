"use client";
import { useRouter } from "next/navigation";

export default function VerifiedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-sky-200 to-white">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ✅ Correo comprobado
        </h1>
        <p className="text-gray-700 mb-6">
          Tu correo ha sido verificado exitosamente. Ya puedes iniciar sesión.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
        >
          Ir al inicio de sesión
        </button>
      </div>
    </main>
  );
}