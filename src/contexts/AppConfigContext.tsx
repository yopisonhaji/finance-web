"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type BusinessType = "PENDIDIKAN" | "PERUSAHAAN" | "";

interface AppConfigContextType {
  tipeBisnis: BusinessType;
  clientTerm: string;
  setTipeBisnis: (type: BusinessType) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export function AppConfigProvider({ 
  children, 
  initialTipeBisnis 
}: { 
  children: ReactNode; 
  initialTipeBisnis: string 
}) {
  const [tipeBisnis, setTipeBisnisState] = useState<BusinessType>(
    (initialTipeBisnis as BusinessType) || ""
  );

  const setTipeBisnis = (type: BusinessType) => {
    setTipeBisnisState(type);
  };

  const clientTerm = tipeBisnis === "PERUSAHAAN" ? "Klien" : "Siswa";

  return (
    <AppConfigContext.Provider value={{ tipeBisnis, clientTerm, setTipeBisnis }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error("useAppConfig must be used within an AppConfigProvider");
  }
  return context;
}
