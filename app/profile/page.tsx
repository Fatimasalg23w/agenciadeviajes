export default function ProfilePage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tu Perfil</h2>
      <p>Nombre: Fatima</p>
      <p>Puntos acumulados: 120</p>
      <h3 className="text-xl font-semibold mt-6">Reservas recientes</h3>
      <ul className="mt-2 space-y-2">
        <li className="border p-3 rounded">Tour a Oaxaca — 50 puntos</li>
        <li className="border p-3 rounded">Tour a CDMX — 40 puntos</li>
      </ul>
    </div>
  );
}
