"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type BusinessType = "PENDIDIKAN" | "PERUSAHAAN" | "";
type PaymentMode = "DEFAULT" | "PRIVATE";

interface AppConfigContextType {
  tipeBisnis: BusinessType;
  clientTerm: string;
  setTipeBisnis: (type: BusinessType) => void;
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export function AppConfigProvider({ 
  children, 
  initialTipeBisnis,
  initialPaymentMode = "DEFAULT"
}: { 
  children: ReactNode; 
  initialTipeBisnis: string;
  initialPaymentMode?: string;
}) {
  const [tipeBisnis, setTipeBisnisState] = useState<BusinessType>(
    (initialTipeBisnis as BusinessType) || ""
  );
  
  const [paymentMode, setPaymentModeState] = useState<PaymentMode>(
    (initialPaymentMode as PaymentMode) || "DEFAULT"
  );

  React.useEffect(() => {
    setTipeBisnisState((initialTipeBisnis as BusinessType) || "");
    setPaymentModeState((initialPaymentMode as PaymentMode) || "DEFAULT");
  }, [initialTipeBisnis, initialPaymentMode]);

  const setTipeBisnis = (type: BusinessType) => {
    setTipeBisnisState(type);
  };
  
  const setPaymentMode = (mode: PaymentMode) => {
    setPaymentModeState(mode);
  };

  const clientTerm = tipeBisnis === "PERUSAHAAN" ? "Klien" : "Siswa";

  return (
    <AppConfigContext.Provider value={{ tipeBisnis, clientTerm, setTipeBisnis, paymentMode, setPaymentMode }}>
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




