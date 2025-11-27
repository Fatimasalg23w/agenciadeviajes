export default function LoginPage() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      <form className="grid gap-4">
        <input type="email" placeholder="Correo electrónico" className="border p-2 rounded" />
        <input type="password" placeholder="Contraseña" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Entrar
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        ¿No tienes cuenta? <a href="#" className="text-blue-600 underline">Regístrate aquí</a>
      </p>
    </div>
  );
}
