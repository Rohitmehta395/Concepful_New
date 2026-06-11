import { createContext, useContext, useState, ReactNode } from "react";
import { Ping } from "./pings";

interface DashboardCtx {
  activePing: Ping | null;
  setActivePing: (p: Ping | null) => void;
  activeProjectId: number | null;
  activeProjectTitle: string | null;
  setActiveProject: (id: number | null, title: string | null) => void;
}

export const DashboardContext = createContext<DashboardCtx>({
  activePing: null,
  setActivePing: () => {},
  activeProjectId: null,
  activeProjectTitle: null,
  setActiveProject: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardCtx;
  children: ReactNode;
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
