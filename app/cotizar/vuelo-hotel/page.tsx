export default function CotizarLibrePage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cotiza Vuelo + Hotel</h2>
      <form className="grid gap-4">
        <input type="text" name="origen" placeholder="Origen" className="border p-2 rounded" />
        <input type="text" name="destino" placeholder="Destino" className="border p-2 rounded" />
        <input type="date" name="fecha_inicio" className="border p-2 rounded" />
        <input type="date" name="fecha_fin" className="border p-2 rounded" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Cotizar Vuelo + Hotel
        </button>
      </form>
    </div>
  );
}
