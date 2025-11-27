export default function CotizadorBanner() {
  return (
    <section className="relative bg-cover bg-center py-20 text-white"
      style={{ backgroundImage: "url('https://via.placeholder.com/1200x400')" }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-4">Cotiza tu viaje ahora</h2>
        <p className="mb-6 text-lg">Tours, vuelos y hoteles con recompensas acumulables</p>
        <a
          href="/cotizar/tour"
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold shadow hover:bg-yellow-500 transition"
        >
          Cotizar Tour
        </a>
      </div>
    </section>
  );
}
