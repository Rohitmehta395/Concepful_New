"use client";

import { useState, useEffect, useCallback } from "react";

const AUTH_KEY    = "concepful_session";
const PRICING_KEY = "concepful_pricing_interest";

export type UserRole = "admin" | "client" | "prospect-hot" | "prospect-cold";

export type AuthSession = {
  email: string;
  plan: string;
  activatedAt: string;
  role?: string;
} | null;

function readSession(): AuthSession {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch { return null; }
}

function readBool(key: string): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(key) === "true"; } catch { return false; }
}

export function useAuthState() {
  const [session, setSession]                   = useState<AuthSession>(readSession);
  const [hasPricingInterest, setPricingInterest] = useState(() => readBool(PRICING_KEY));

  const isAdmin = session?.role === "admin";

  const role: UserRole =
    isAdmin            ? "admin" :
    !!session          ? "client" :
    hasPricingInterest ? "prospect-hot" :
                         "prospect-cold";

  const login = useCallback((email: string, plan: string, sessionRole?: string) => {
    if (typeof window === "undefined") return;
    const s: AuthSession = { email, plan, activatedAt: new Date().toISOString(), role: sessionRole };
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
  }, []);

  const markPricingInterest = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PRICING_KEY, "true");
    setPricingInterest(true);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        const s: AuthSession = e.newValue ? JSON.parse(e.newValue) : null;
        setSession(s);
      }
      if (e.key === PRICING_KEY) setPricingInterest(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    session,
    isLoggedIn: !!session,
    isAdmin,
    hasPricingInterest,
    role,
    login,
    logout,
    markPricingInterest,
  };
}
