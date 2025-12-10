import Navbar from "../components/Navbar";
import "../styles/globals.css";
import { Playfair_Display } from "next/font/google";
import { UserProvider } from "@/context/UserContext"; // 👈 importa el provider

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "Tres en ruta",
  description: "Tours, vuelos y recompensas en México",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={playfair.className}>
        {/* 👇 envuelve toda la app con el UserProvider */}
        <UserProvider>
          <Navbar />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
