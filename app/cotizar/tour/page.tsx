export default function CotizarTourPage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cotiza Tour + Vuelo + Hotel</h2>
      <form className="grid gap-4">
        <select name="tour" className="border p-2 rounded">
          <option value="">Selecciona un tour</option>
          <option value="cdmx">Ciudad de México</option>
          <option value="riviera">Riviera Maya</option>
        </select>
        <input type="date" name="fecha_inicio" className="border p-2 rounded" />
        <input type="date" name="fecha_fin" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Cotizar
        </button>
      </form>
    </div>
  );
}
