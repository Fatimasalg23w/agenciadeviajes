import CotizadorBanner from "../components/CotizadorBanner";
import TourCard from "../components/TourCard";
import OffersCarousel from "../components/OffersCarousel";

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
      <div
        className="bg-cover bg-center bg-no-repeat h-[40vh] flex flex-col justify-center items-center text-white relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Explora México</h1>
          <p className="text-lg">Tours, vuelos y hoteles con recompensas acumulables</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mt-0">
        <CotizadorBanner />
      </div>

      {/* Tarjetas de beneficios */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 max-w-6xl mx-auto mt-12">
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-orange-600 mb-2">Gana puntos ✈️</h3>
          <p className="text-gray-600">Acumula puntos en cada compra de vuelos, hoteles y tours.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-orange-600 mb-2">Usa tus recompensas 🎁</h3>
          <p className="text-gray-600">Canjea tus puntos para obtener descuentos en tus próximos viajes.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-orange-600 mb-2">Ofertas exclusivas 🌟</h3>
          <p className="text-gray-600">Accede a promociones especiales solo para miembros con puntos.</p>
        </div>
      </section>

      {/* Carousel de Ofertas */}
      <div className="mt-12">
        <OffersCarousel />
      </div>

      {/* Tours Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-10 justify-items-center mt-12">
        {tours.map((tour) => (
          <TourCard
            key={tour._id}
            nombre={tour.nombre}
            destino={tour.destino}
            descripcion={tour.descripcion}
            precio={tour.precio}
            imagen="https://images.unsplash.com/photo-1521216774850-01bc1c5fe0da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            fecha_inicio={tour.fecha_inicio}
            fecha_fin={tour.fecha_fin}
            tipo={tour.destino === "CDMX" ? "Ciudad" : "Playa"}
          />
        ))}
      </section>
    </>
  );
}
