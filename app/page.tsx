import CotizadorBanner from "../components/CotizadorBanner";
import TourCard from "../components/TourCard";

interface Tour {
  _id: string;
  nombre: string;
  destino: string;
  descripcion: string;
  precio: number;
  imagen: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo?: string;
}

export default async function HomePage() {
  const res = await fetch("http://localhost:8000/tours", { cache: "no-store" });
  const tours: Tour[] = await res.json();

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen pt-24 flex flex-col items-center justify-center text-center bg-gradient-to-b from-orange-100 to-amber-300">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10">
          <h1 className="text-6xl font-bold text-amber-900">Explora México</h1>
          <p className="mt-6 text-2xl text-amber-800">
            Tours, vuelos y hoteles con recompensas acumulables
          </p>
        </div>
      </section>

      <CotizadorBanner />

      {/* Tours Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-10 justify-items-center">
        {tours.map((tour) => (
          <TourCard
            key={tour._id}
            nombre={tour.nombre}
            destino={tour.destino}
            descripcion={tour.descripcion}
            precio={tour.precio}
            imagen={
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0"
            }
            fecha_inicio={tour.fecha_inicio}
            fecha_fin={tour.fecha_fin}
            tipo={tour.destino === "CDMX" ? "Ciudad" : "Playa"}
          />
        ))}
      </section>
    </>
  );
}
