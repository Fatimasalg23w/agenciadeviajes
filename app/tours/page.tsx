// app/tours/page.tsx
import TourCard from "../../components/TourCard";

export default async function ToursPage() {
  const res = await fetch("http://localhost:3000/api/tours", { cache: "no-store" });
  const tours = await res.json();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Catálogo de Tours</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {tours.map((tour: any) => (
          <TourCard
            key={tour._id}
            nombre={tour.nombre}
            destino={tour.destinos?.join(", ")}
            descripcion={tour.descripcion}
            precio={tour.precio_base}
            imagen={tour.imagenes?.[0]}
          />
        ))}
      </div>
    </div>
  );
}
