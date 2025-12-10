// app/tours/page.tsx
import TourCard from "../../components/TourCard";

export default async function ToursPage() {
  try {
    // Usa la variable de entorno para definir la base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
    const res = await fetch(`${baseUrl}/api/tours`, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Error al cargar tours");
    }

    const tours = await res.json();
    console.log("Tours data:", tours);

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Catálogo de Tours</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {tours.map((tour: any) => (
            <TourCard
              key={tour._id}
              nombre={tour.nombre}
              destino={Array.isArray(tour.destinos) ? tour.destinos.join(", ") : ""}
              descripcion={tour.descripcion}
              precio={tour.costoTotal}
              imagen={tour.imagenes?.[0]}
              fecha_inicio={tour.fechas?.inicio}
              fecha_fin={tour.fechas?.fin}
              tipo={tour.tipo}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error cargando tours:", error);
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Catálogo de Tours</h2>
        <p className="text-red-500">Error cargando tours</p>
      </div>
    );
  }
}
