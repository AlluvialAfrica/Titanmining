import React, { createContext, useContext, useState } from 'react';

interface GuidanceContextType {
  guidanceEnabled: boolean;
  setGuidanceEnabled: (enabled: boolean) => void;
}

const GuidanceContext = createContext<GuidanceContextType>({
  guidanceEnabled: false,
  setGuidanceEnabled: () => {},
});

export function GuidanceProvider({ children }: { children: React.ReactNode }) {
  const [guidanceEnabled, setGuidanceState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('guidanceEnabled');
      return saved === 'true';
    } catch { /* ignore */ }
    return false;
  });

  const setGuidanceEnabled = (enabled: boolean) => {
    setGuidanceState(enabled);
    try { localStorage.setItem('guidanceEnabled', String(enabled)); } catch { /* ignore */ }
  };

  return (
    <GuidanceContext.Provider value={{ guidanceEnabled, setGuidanceEnabled }}>
      {children}
    </GuidanceContext.Provider>
  );
}

export const useGuidance = () => useContext(GuidanceContext);
