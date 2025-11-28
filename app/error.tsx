"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-red-600">Algo salió mal</h2>
      <p className="mt-2 text-gray-700">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg"
      >
        Reintentar
      </button>
    </div>
  );
}
