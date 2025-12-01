"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    email: "",
    telefono: "",
    password: "",
    paisResidencia: "", // nuevo campo
    notRobot: false,
  });

  // ✅ Corregido: manejamos inputs y selects de forma segura
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.notRobot) {
      alert("Por favor confirma que no eres un robot 🤖");
      return;
    }

    // Validación de contraseña fuerte en el cliente
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPassword.test(formData.password)) {
      alert(
        "La contraseña debe tener mínimo 8 caracteres con letras, números y símbolos."
      );
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Enviar código por correo
      await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      });

      // Guardar usuario en la base (el backend encripta la contraseña y genera clientNumber)
      const res = await fetch("/api/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          fechaNacimiento: formData.fechaNacimiento,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password, // se encripta en el backend
          paisResidencia: formData.paisResidencia,
          code,
          status: "pending",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "No se pudo registrar.");
        return;
      }

      // Guardar el correo en localStorage para la verificación
      localStorage.setItem("userEmail", formData.email.trim().toLowerCase());

      router.push("/register/verify");
    } catch (error) {
      console.error("Error en registro:", error);
      alert("Hubo un problema al registrarte. Intenta de nuevo.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#ffc75f]">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-4xl min-h-[450px] bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 flex flex-col justify-center text-black">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#e67e22]">
            Registro de Perfil
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
            <input
              type="date"
              name="fechaNacimiento"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
              min="1940-01-01"
              max={new Date().toISOString().split("T")[0]}
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña (mínimo 8 caracteres, letras, números y símbolos)"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />

            {/* Nuevo campo de país de residencia */}
            <select
              name="paisResidencia"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">Selecciona tu país de residencia</option>
              <option value="Australia">Australia</option>
              <option value="UK">UK</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="notRobot" onChange={handleChange} />
              <span>No soy un robot 🤖</span>
            </label>

            <button
              type="submit"
              className="w-full bg-[#a8bb5c] text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Registrarme
            </button>
          </form>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1584669727833-88b47506defb?q=80&w=1062&auto=format&fit=crop&ixlib=rb-4.1.0"
            alt="Registro"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </main>
  );
}

