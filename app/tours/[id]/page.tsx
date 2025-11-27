import { notFound } from "next/navigation";

export default async function TourDetail({ params }: { params: { id: string } }) {
  // params.id viene de la URL (ej: /tours/123)
  const res = await fetch(`http://localhost:8000/tours/${params.id}`, { cache: "no-store" });

  if (!res.ok) return notFound();
  const tour = await res.json();

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold">{tour.nombre}</h2>
      <p className="text-gray-600">{tour.destino}</p>

      <img
        src={tour.imagenes?.[0]}
        alt={tour.nombre}
        className="w-full h-64 object-cover rounded my-4"
      />

      <p>{tour.descripcion}</p>

      <h3 className="text-xl font-semibold mt-6">Itinerario</h3>
      <ul className="mt-2 space-y-2">
        {tour.itinerario?.map((d: any) => (
          <li key={d.dia} className="border p-3 rounded">
            <strong>Día {d.dia}:</strong> {d.ciudad} — {d.titulo}
            <div className="text-sm text-gray-500">Hotel sugerido: {d.hotel_sugerido}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
