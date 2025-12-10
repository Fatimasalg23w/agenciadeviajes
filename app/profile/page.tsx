"use client";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("perfil");

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (!storedUser) return;

    const parsedUser = JSON.parse(storedUser);

    fetch(`/api/me?email=${parsedUser.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Error cargando perfil:", err));
  }, []);

  if (!user) return <p className="text-center mt-10 text-gray-500">Cargando perfil...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-extrabold text-[#e76f51] mb-6 text-center">
        Tu Perfil
      </h2>

      {/* Pestañas */}
      <div className="flex justify-center gap-6 mb-8 border-b pb-2">
        <button
          onClick={() => setActiveTab("perfil")}
          className={`pb-2 ${activeTab === "perfil" ? "border-b-4 border-[#e76f51] font-bold text-[#e76f51]" : "text-gray-600"}`}
        >
          Datos Personales
        </button>
        <button
          onClick={() => setActiveTab("reservas")}
          className={`pb-2 ${activeTab === "reservas" ? "border-b-4 border-[#e76f51] font-bold text-[#e76f51]" : "text-gray-600"}`}
        >
          Mis Reservas
        </button>
        <button
          onClick={() => setActiveTab("ajustes")}
          className={`pb-2 ${activeTab === "ajustes" ? "border-b-4 border-[#e76f51] font-bold text-[#e76f51]" : "text-gray-600"}`}
        >
          Ajustes
        </button>
      </div>

      {/* Contenido dinámico */}
      {activeTab === "perfil" && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-3">
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Número de cliente:</strong> {user.clientNumber}</p>
          <p><strong>Nacionalidad:</strong> {user.nacionalidad}</p>
          <p><strong>Puntos acumulados:</strong> {user.puntos}</p>
        </div>
      )}

      {activeTab === "reservas" && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-[#e76f51]">Reservas recientes</h3>
          {user.reservas && user.reservas.length > 0 ? (
            <ul className="space-y-3">
              {user.reservas.map((r: any, i: number) => (
                <li key={i} className="border p-3 rounded-lg hover:bg-gray-50 transition">
                  <span className="font-semibold">{r.destino}</span> — {r.puntos} puntos
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Sin reservas</p>
          )}
        </div>
      )}

      {activeTab === "ajustes" && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-[#e76f51]">Ajustes de cuenta</h3>
          <form className="space-y-4">
            <input type="email" placeholder="Nuevo correo" className="border p-2 rounded w-full focus:ring-2 focus:ring-[#e76f51]" />
            <input type="password" placeholder="Nueva contraseña" className="border p-2 rounded w-full focus:ring-2 focus:ring-[#e76f51]" />
            <input type="text" placeholder="Número de pasaporte" className="border p-2 rounded w-full focus:ring-2 focus:ring-[#e76f51]" />
            <button className="w-full bg-[#a8bb5c] text-white px-4 py-2 rounded hover:bg-[#8fa34d] transition">
              Guardar cambios
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
