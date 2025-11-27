export default function RewardsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Programa de Recompensas</h2>
      <ul className="space-y-4">
        <li><strong>Acumula Puntos:</strong> Gana 10 puntos por cada día de tour reservado.</li>
        <li><strong>Canjea Recompensas:</strong> Usa tus puntos para descuentos en futuros tours.</li>
        <li><strong>Niveles Exclusivos:</strong> Desbloquea beneficios VIP al acumular más puntos.</li>
        <li><strong>Bonos Especiales:</strong> Recibe puntos extra en temporadas promocionales.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-600">Ejemplo: un tour de 5 días = 50 puntos</p>
    </div>
  );
}
