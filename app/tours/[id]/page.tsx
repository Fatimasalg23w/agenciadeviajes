import { notFound } from "next/navigation";

export default async function TourDetail({ params }: { params: { id: string } }) {
  const res = await fetch(`http://localhost:8000/tours/${params.id}`, { cache: "no-store" });
  if (!res.ok) return notFound();
  const tour = await res.json();

  // Simulación de datos externos (vuelo y hotel)
  const vuelo = { precio: 3500, origen: "CDMX", destino: tour.destino, fecha: tour.fecha_inicio };
  const hotel = { precio: 4200, nombre: tour.itinerario?.[0]?.hotel_sugerido || "Hotel incluido" };

  // Calcular total con comisión
  const total = vuelo.precio + hotel.precio + tour.precio;
  const totalConComision = total * 1.15;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero con imagen */}
      <div className="relative h-[50vh] w-full">
        <img
          src={tour.imagenes?.[0]}
          alt={tour.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{tour.nombre}</h1>
          <p className="text-lg md:text-xl">{tour.destino}</p>
          <p className="mt-2 text-sm md:text-base">
            {tour.fecha_inicio} - {tour.fecha_fin}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto p-8 space-y-10">
        {/* Descripción */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-orange-700 mb-4">Descripción del Tour</h2>
          <p className="text-gray-700">{tour.descripcion}</p>
        </div>

        {/* Vuelo */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-orange-700 mb-4">Vuelo incluido</h2>
          <p>Vuelo más barato encontrado: <strong>{vuelo.origen} → {vuelo.destino}</strong></p>
          <p>Fecha: {vuelo.fecha}</p>
          <p className="text-orange-600 font-semibold">Precio: ${vuelo.precio} MXN</p>
        </div>

        {/* Hotel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-orange-700 mb-4">Hotel incluido</h2>
          <p>Hotel sugerido: <strong>{hotel.nombre}</strong></p>
          <p className="text-orange-600 font-semibold">Precio: ${hotel.precio} MXN</p>
        </div>

        {/* Itinerario */}
        <div>
          <h2 className="text-2xl font-bold text-orange-700 mb-6">Itinerario de 7 días</h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {tour.itinerario?.map((d: any) => (
              <li key={d.dia} className="bg-white border rounded-lg shadow-md p-4">
                <strong className="text-orange-600">Día {d.dia}:</strong> {d.ciudad} — {d.titulo}
                <div className="text-sm text-gray-500 mt-2">Hotel sugerido: {d.hotel_sugerido}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Precio total con comisión */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center">
          <span className="text-2xl font-extrabold text-orange-700">
            Total paquete (con 15% comisión): ${totalConComision.toFixed(2)} MXN
          </span>
          <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
            Reservar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
