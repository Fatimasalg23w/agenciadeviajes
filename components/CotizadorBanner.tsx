"use client";
import React, { useState, useMemo } from "react";
import { MapPinIcon, CalendarDaysIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type Airport = { name: string; city: string; code: string };

const airportsOrigin: Airport[] = [
  { name: "London Heathrow Airport", city: "Londres", code: "LHR" },
  { name: "London Gatwick Airport", city: "Londres", code: "LGW" },
  { name: "Toronto Pearson International Airport", city: "Toronto", code: "YYZ" },
  { name: "Montreal Pierre Elliott Trudeau International Airport", city: "Montreal", code: "YUL" },
  { name: "Sydney Kingsford Smith International Airport", city: "Sydney", code: "SYD" },
];

const airportsDestination: Airport[] = [
  { name: "Cancun International Airport", city: "Cancún", code: "CUN" },
  { name: "Mexico City International Airport", city: "Ciudad de México", code: "MEX" },
  { name: "Oaxaca International Airport", city: "Oaxaca", code: "OAX" },
  { name: "Guadalajara International Airport", city: "Guadalajara", code: "GDL" },
  { name: "Los Cabos International Airport", city: "Los Cabos", code: "SJD" },
];

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

type Room = { adults: number; children: number };

export default function CotizadorBanner() {
  const router = useRouter();

  const [tab, setTab] = useState<"flightHotel" | "flightHotelTour">("flightHotel");

  const [originDisplay, setOriginDisplay] = useState("");
  const [destinationDisplay, setDestinationDisplay] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tourMonth, setTourMonth] = useState("");
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0 }]);

  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [activeOriginIndex, setActiveOriginIndex] = useState(-1);
  const [activeDestinationIndex, setActiveDestinationIndex] = useState(-1);

  const filterAirports = (input: string, list: Airport[]) => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q)
    );
  };

  const originSuggestions = useMemo(
    () => filterAirports(originDisplay, airportsOrigin),
    [originDisplay]
  );
  const destinationSuggestions = useMemo(
    () => filterAirports(destinationDisplay, airportsDestination),
    [destinationDisplay]
  );

  const addRoom = () => {
    if (rooms.length < 5) setRooms([...rooms, { adults: 2, children: 0 }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index: number, field: "adults" | "children", value: number) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };

  const adultsOptions = [1, 2, 3, 4, 5, 6];
  const childrenOptions = [0, 1, 2, 3, 4];

  const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);

  const getRoomsText = () => {
    return `${rooms.length} hab, ${totalAdults} adult${totalAdults > 1 ? 's' : ''}, ${totalChildren} niño${totalChildren !== 1 ? 's' : ''}`;
  };

  const handleQuote = () => {
    // Validaciones
    if (!origin || !destination) {
      alert("Por favor selecciona origen y destino");
      return;
    }

    if (tab === "flightHotel" && (!departureDate || !returnDate)) {
      alert("Por favor selecciona fechas de ida y vuelta");
      return;
    }

    if (tab === "flightHotelTour" && !tourMonth) {
      alert("Por favor selecciona un mes para el tour");
      return;
    }

    const payload = {
      origin,
      destination,
      departureDate: tab === "flightHotel" ? departureDate : "",
      returnDate: tab === "flightHotel" ? returnDate : "",
      tourMonth: tab === "flightHotelTour" ? tourMonth : "",
      rooms: rooms.length,
      adults: totalAdults,
      children: totalChildren,
      roomDetails: rooms,
      packageType: tab === "flightHotel" ? "PAQUETE" : "PAQUETE+TOUR",
      timestamp: new Date().toISOString(),
    };

    console.log("Payload enviado:", payload);
    localStorage.setItem("lastQuote", JSON.stringify(payload));
    router.push("/resultados");
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#a8bb5c] to-[#8da040] shadow-xl py-6 px-6">
      {/* Tabs */}
      <div className="flex justify-end gap-3 mb-5">
        <button
          className={`px-5 py-2 rounded-lg font-semibold transition-all ${
            tab === "flightHotel" 
              ? "bg-white text-[#556B2F] shadow-md" 
              : "bg-[#556B2F] text-white hover:bg-[#445522]"
          }`}
          onClick={() => setTab("flightHotel")}
        >
          Flight + Hotel
        </button>
        <button
          className={`px-5 py-2 rounded-lg font-semibold transition-all ${
            tab === "flightHotelTour" 
              ? "bg-white text-[#556B2F] shadow-md" 
              : "bg-[#556B2F] text-white hover:bg-[#445522]"
          }`}
          onClick={() => setTab("flightHotelTour")}
        >
          Flight + Hotel + Tour
        </button>
      </div>

      {/* Form - Todo en una línea */}
      <div className="flex items-end gap-3">
        {/* Origin */}
        <div className="flex flex-col relative flex-1 z-50">
          <label className="text-white text-xs font-semibold mb-1.5 px-1">Origin</label>
          <div className="flex items-center border-2 border-white/30 rounded-lg p-2.5 bg-white hover:border-white transition-all">
            <MapPinIcon className="h-5 w-5 text-[#d35400] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="City or airport"
              className="flex-1 outline-none bg-transparent text-sm"
              value={originDisplay}
              onChange={(e) => {
                setOriginDisplay(e.target.value);
                setShowOriginSuggestions(e.target.value.trim().length > 0);
                setActiveOriginIndex(-1);
              }}
              onKeyDown={(e) => {
                if (!showOriginSuggestions) return;
                if (e.key === "ArrowDown") {
                  setActiveOriginIndex((prev) => Math.min(prev + 1, originSuggestions.length - 1));
                  e.preventDefault();
                } else if (e.key === "ArrowUp") {
                  setActiveOriginIndex((prev) => Math.max(prev - 1, 0));
                  e.preventDefault();
                } else if (e.key === "Enter" && activeOriginIndex >= 0) {
                  const selected = originSuggestions[activeOriginIndex];
                  setOrigin(selected.city);
                  setOriginDisplay(`${selected.city} (${selected.code})`);
                  setShowOriginSuggestions(false);
                  e.preventDefault();
                }
              }}
            />
          </div>
          {showOriginSuggestions && originSuggestions.length > 0 && (
            <ul className="absolute top-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 w-full max-h-[280px] overflow-y-auto">
              {originSuggestions.map((a, index) => (
                <li
                  key={a.code}
                  className={`px-4 py-3 cursor-pointer border-b last:border-b-0 ${
                    index === activeOriginIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onMouseDown={() => {
                    setOrigin(a.city);
                    setOriginDisplay(`${a.city} (${a.code})`);
                    setShowOriginSuggestions(false);
                  }}
                >
                  <div className="font-semibold text-sm">{a.city}</div>
                  <div className="text-xs text-gray-600">{a.name}</div>
                  <div className="text-xs text-blue-600 font-mono">{a.code}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Destination */}
        <div className="flex flex-col relative flex-1 z-40">
          <label className="text-white text-xs font-semibold mb-1.5 px-1">Destination</label>
          <div className="flex items-center border-2 border-white/30 rounded-lg p-2.5 bg-white hover:border-white transition-all">
            <MapPinIcon className="h-5 w-5 text-[#d35400] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="City or airport"
              className="flex-1 outline-none bg-transparent text-sm"
              value={destinationDisplay}
              onChange={(e) => {
                setDestinationDisplay(e.target.value);
                setShowDestinationSuggestions(e.target.value.trim().length > 0);
                setActiveDestinationIndex(-1);
              }}
              onKeyDown={(e) => {
                if (!showDestinationSuggestions) return;
                if (e.key === "ArrowDown") {
                  setActiveDestinationIndex((prev) => Math.min(prev + 1, destinationSuggestions.length - 1));
                  e.preventDefault();
                } else if (e.key === "ArrowUp") {
                  setActiveDestinationIndex((prev) => Math.max(prev - 1, 0));
                  e.preventDefault();
                } else if (e.key === "Enter" && activeDestinationIndex >= 0) {
                  const selected = destinationSuggestions[activeDestinationIndex];
                  setDestination(selected.city);
                  setDestinationDisplay(`${selected.city} (${selected.code})`);
                  setShowDestinationSuggestions(false);
                  e.preventDefault();
                }
              }}
            />
          </div>
          {showDestinationSuggestions && destinationSuggestions.length > 0 && (
            <ul className="absolute top-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 w-full max-h-[280px] overflow-y-auto">
              {destinationSuggestions.map((a, index) => (
                <li
                  key={a.code}
                  className={`px-4 py-3 cursor-pointer border-b last:border-b-0 ${
                    index === activeDestinationIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onMouseDown={() => {
                    setDestination(a.city);
                    setDestinationDisplay(`${a.city} (${a.code})`);
                    setShowDestinationSuggestions(false);
                  }}
                >
                  <div className="font-semibold text-sm">{a.city}</div>
                  <div className="text-xs text-gray-600">{a.name}</div>
                  <div className="text-xs text-blue-600 font-mono">{a.code}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dates or Tour Month */}
        {tab === "flightHotel" ? (
          <>
            <div className="flex flex-col flex-1">
              <label className="text-white text-xs font-semibold mb-1.5 px-1">Departure</label>
              <div className="flex items-center border-2 border-white/30 rounded-lg p-2.5 bg-white hover:border-white transition-all">
                <CalendarDaysIcon className="h-5 w-5 text-[#d35400] mr-2 flex-shrink-0" />
                <input
                  type="date"
                  className="flex-1 outline-none bg-transparent text-sm"
                  value={departureDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-white text-xs font-semibold mb-1.5 px-1">Return</label>
              <div className="flex items-center border-2 border-white/30 rounded-lg p-2.5 bg-white hover:border-white transition-all">
                <CalendarDaysIcon className="h-5 w-5 text-[#d35400] mr-2 flex-shrink-0" />
                <input
                  type="date"
                  className="flex-1 outline-none bg-transparent text-sm"
                  value={returnDate}
                  min={departureDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col flex-1">
            <label className="text-white text-xs font-semibold mb-1.5 px-1">Tour Month</label>
            <div className="flex items-center border-2 border-white/30 rounded-lg p-2.5 bg-white hover:border-white transition-all">
              <CalendarDaysIcon className="h-5 w-5 text-[#d35400] mr-2 flex-shrink-0" />
              <select
                className="flex-1 outline-none bg-transparent text-sm"
                value={tourMonth}
                onChange={(e) => setTourMonth(e.target.value)}
              >
                <option value="">Select month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Rooms - Modal Trigger */}
        <div className="flex flex-col flex-1 relative z-30">
          <label className="text-white text-xs font-semibold mb-1.5 px-1">Guests</label>
          <div 
            className="flex items-center border-2 border-white/30 rounded-lg p-2.5 bg-white hover:border-white transition-all cursor-pointer"
            onClick={() => setShowRoomsModal(!showRoomsModal)}
          >
            <UserIcon className="h-5 w-5 text-[#d35400] mr-2 flex-shrink-0" />
            <span className="flex-1 text-sm text-gray-700">{getRoomsText()}</span>
          </div>

          {/* Rooms Modal */}
          {showRoomsModal && (
            <>
              <div 
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setShowRoomsModal(false)}
              />
              <div className="absolute top-full mt-2 right-0 bg-white border-2 border-gray-200 rounded-lg shadow-2xl z-50 w-[400px] max-h-[500px] overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Configure Rooms</h3>
                    <button
                      onClick={() => setShowRoomsModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {rooms.map((room, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">Room {index + 1}</span>
                        {rooms.length > 1 && (
                          <button
                            className="text-red-600 hover:text-red-800 text-sm"
                            onClick={() => removeRoom(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Adults</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            value={room.adults}
                            onChange={(e) => updateRoom(index, "adults", parseInt(e.target.value))}
                          >
                            {adultsOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt} adult{opt > 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Children (under 12)</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            value={room.children}
                            onChange={(e) => updateRoom(index, "children", parseInt(e.target.value))}
                          >
                            {childrenOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt} child{opt !== 1 ? "ren" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {rooms.length < 5 && (
                    <button
                      className="w-full border-2 border-dashed border-[#556B2F] rounded-lg p-3 text-[#556B2F] font-semibold hover:bg-[#556B2F] hover:text-white transition-all"
                      onClick={addRoom}
                    >
                      + Add Another Room
                    </button>
                  )}

                  <button
                    className="w-full mt-4 bg-[#556B2F] text-white py-3 rounded-lg font-semibold hover:bg-[#445522] transition-colors"
                    onClick={() => setShowRoomsModal(false)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quote Button */}
        <button
          className="bg-[#d35400] text-white px-8 py-3 text-base rounded-lg font-bold hover:bg-[#b84600] transition-all shadow-lg whitespace-nowrap"
          onClick={handleQuote}
        >
          Get Quote
        </button>
      </div>
    </div>
  );
}