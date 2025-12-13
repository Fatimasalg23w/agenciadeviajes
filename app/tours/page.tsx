"use client";
import { useState, useEffect } from "react";
import { 
  BeachAccessOutlined, 
  LocationCityOutlined, 
  FavoriteOutlined, 
  FamilyRestroomOutlined, 
  PersonOutlined,
  SpaOutlined,
  CelebrationOutlined,
  HikingOutlined
} from "@mui/icons-material";

interface Tour {
  _id: string;
  nombre: string;
  descripcion: string;
  destinos: string[];
  imagenes: string[];
  fechas: {
    inicio: string;
    fin: string;
  };
  costoTotal: number;
  costoVuelo: number;
  dias: any[];
  category?: string;
  vibe?: string; // relax, party, adventure
}

type Category = "beach" | "city" | "couple" | "family" | "solo";
type Vibe = "relax" | "party" | "adventure";

const categories = [
  {
    id: "beach" as Category,
    name: "Beach",
    icon: BeachAccessOutlined,
    color: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    id: "city" as Category,
    name: "City",
    icon: LocationCityOutlined,
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600"
  },
  {
    id: "couple" as Category,
    name: "Couple",
    icon: FavoriteOutlined,
    color: "from-pink-400 to-rose-500",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600"
  },
  {
    id: "family" as Category,
    name: "Family",
    icon: FamilyRestroomOutlined,
    color: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600"
  },
  {
    id: "solo" as Category,
    name: "Solo Trip",
    icon: PersonOutlined,
    color: "from-purple-400 to-violet-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  }
];

const vibes = [
  {
    id: "relax" as Vibe,
    name: "I want to relax",
    icon: SpaOutlined,
    color: "from-teal-400 to-cyan-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-600",
    description: "Peaceful getaways and tranquil experiences"
  },
  {
    id: "party" as Vibe,
    name: "I want to party",
    icon: CelebrationOutlined,
    color: "from-fuchsia-400 to-pink-500",
    bgColor: "bg-fuchsia-50",
    textColor: "text-fuchsia-600",
    description: "Vibrant nightlife and social experiences"
  },
  {
    id: "adventure" as Vibe,
    name: "I want adventure",
    icon: HikingOutlined,
    color: "from-orange-400 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    description: "Exciting activities and thrilling experiences"
  }
];

export default function ToursPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTours() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
        const res = await fetch(`${baseUrl}/api/tours`, { cache: "no-store" });
        
        if (!res.ok) throw new Error("Error loading tours");
        
        const data = await res.json();
        setTours(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading tours");
      } finally {
        setLoading(false);
      }
    }
    
    fetchTours();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter tours based on category and vibe
  const filteredTours = tours.filter(tour => {
    const categoryMatch = !selectedCategory || tour.category === selectedCategory;
    const vibeMatch = !selectedVibe || tour.vibe === selectedVibe;
    return categoryMatch && vibeMatch;
  });

  const handleCategorySelect = (categoryId: Category) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedVibe(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedVibe(null); // Reset vibe when changing category
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading tours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Discover Your Perfect Trip</h1>
          <p className="text-xl opacity-90">Choose your travel style and explore amazing destinations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Step 1: Categories Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Step 1: What type of experience are you looking for?
          </h2>
          <p className="text-gray-600 text-center mb-8">Select your travel style</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`
                    relative overflow-hidden rounded-2xl p-6 transition-all duration-300 
                    ${isSelected 
                      ? `bg-gradient-to-br ${category.color} text-white shadow-2xl scale-105` 
                      : `${category.bgColor} hover:shadow-xl hover:scale-105`
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`
                      p-3 rounded-full 
                      ${isSelected ? 'bg-white/20' : 'bg-white'}
                    `}>
                      <Icon 
                        className={`text-4xl ${isSelected ? 'text-white' : category.textColor}`}
                      />
                    </div>
                    <span className={`
                      font-semibold text-lg
                      ${isSelected ? 'text-white' : 'text-gray-700'}
                    `}>
                      {category.name}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Vibe Selection (only shown after category selection) */}
        {selectedCategory && (
          <div className="mb-12 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
              Step 2: What's your vibe?
            </h2>
            <p className="text-gray-600 text-center mb-8">Tell us what kind of experience you're seeking</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {vibes.map((vibe) => {
                const Icon = vibe.icon;
                const isSelected = selectedVibe === vibe.id;
                
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(isSelected ? null : vibe.id)}
                    className={`
                      relative overflow-hidden rounded-2xl p-8 transition-all duration-300 
                      ${isSelected 
                        ? `bg-gradient-to-br ${vibe.color} text-white shadow-2xl scale-105 ring-4 ring-white` 
                        : `${vibe.bgColor} hover:shadow-xl hover:scale-102`
                      }
                    `}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className={`
                        p-4 rounded-full 
                        ${isSelected ? 'bg-white/20' : 'bg-white'}
                      `}>
                        <Icon 
                          className={`text-5xl ${isSelected ? 'text-white' : vibe.textColor}`}
                        />
                      </div>
                      <span className={`
                        font-bold text-xl
                        ${isSelected ? 'text-white' : 'text-gray-800'}
                      `}>
                        {vibe.name}
                      </span>
                      <p className={`
                        text-sm text-center
                        ${isSelected ? 'text-white/90' : 'text-gray-600'}
                      `}>
                        {vibe.description}
                      </p>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/10 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tours Grid */}
        {(selectedCategory || filteredTours.length > 0) && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedVibe 
                  ? `${vibes.find(v => v.id === selectedVibe)?.name} - ${categories.find(c => c.id === selectedCategory)?.name} Tours`
                  : selectedCategory 
                    ? `${categories.find(c => c.id === selectedCategory)?.name} Tours` 
                    : "All Recommended Tours"
                }
              </h3>
              {(selectedCategory || selectedVibe) && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedVibe(null);
                  }}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                >
                  Clear filters ✕
                </button>
              )}
            </div>
            
            {filteredTours.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg mb-2">No tours found for this selection</p>
                <p className="text-gray-500 text-sm">Try a different combination or check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour) => (
                  <div
                    key={tour._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                  >
                    {tour.imagenes?.[0] ? (
                      <img
                        src={tour.imagenes[0]}
                        alt={tour.nombre}
                        className="w-full h-56 object-cover"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No image</span>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        {tour.nombre}
                      </h4>
                      
                      {tour.destinos && tour.destinos.length > 0 && (
                        <p className="text-sm text-orange-600 font-medium mb-2">
                          {tour.destinos.join(" • ")}
                        </p>
                      )}
                      
                      {tour.descripcion && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {tour.descripcion}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{tour.dias?.length || 0} days</span>
                        {tour.fechas && (
                          <span className="text-xs">
                            {formatDate(tour.fechas.inicio)} - {formatDate(tour.fechas.fin)}
                          </span>
                        )}
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-gray-500">Flight</span>
                          <span className="text-sm font-medium text-gray-700">
                            ${tour.costoVuelo?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-semibold text-gray-700">Total</span>
                          <span className="text-2xl font-bold text-orange-600">
                            ${tour.costoTotal?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}