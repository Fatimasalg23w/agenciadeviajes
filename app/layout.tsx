import Navbar from "../components/Navbar";
import "../styles/globals.css"; // ✅ ruta corregida
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "Explore México Tours",
  description: "Tours, vuelos y recompensas en México",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={playfair.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
