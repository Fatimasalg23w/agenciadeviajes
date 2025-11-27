export default function Navbar() {
  return (
    <nav className="sticky top-0 bg-gradient-to-r from-orange-500 via-yellow-600 to-amber-700 backdrop-blur-md shadow-md z-50 py-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-6 text-white">
        <h1 className="font-bold text-2xl tracking-wide">Explore México Tours</h1>
        <div className="flex space-x-6 text-lg font-medium">
          <a href="/tours" className="hover:text-gray-200 transition-colors">Tours</a>
          <a href="/rewards" className="hover:text-gray-200 transition-colors">Recompensas</a>
          <a href="/videos" className="hover:text-gray-200 transition-colors">Videos</a>
          <a
            href="/login"
            className="bg-white text-orange-600 px-4 py-1 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    </nav>
  );
}
