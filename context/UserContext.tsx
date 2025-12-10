"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
  id: string;
  nombre?: string;
  apellido?: string;
  email: string;
  telefono?: string;
  status?: string;
  clientNumber?: string;
  nacionalidad?: string;
  sexo?: string;
} | null;

type UserContextValue = {
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("loggedUser");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Mantener sincronizado si cambia localStorage (otras pestañas)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "loggedUser") {
        const stored = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(stored);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem("loggedUser");
    setUser(null);
    window.location.href = "/"; // redirigir al home
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
