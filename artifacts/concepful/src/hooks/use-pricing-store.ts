import { useState, useEffect } from "react";
import { TIERS, AI_OPS } from "@/lib/pricing";

export type TierKey      = keyof typeof TIERS;
export type AiOpsKey     = keyof typeof AI_OPS;
export type PricingMode  = "retainer" | "oneTime";

const VALID_AI_KEYS = Object.keys(AI_OPS) as AiOpsKey[];

export function usePricingStore() {
  const [tier, setTier] = useState<TierKey>(() => {
    const saved = localStorage.getItem("pricing_tier");
    return (saved as TierKey) || "signal";
  });

  const [billing, setBilling] = useState<"monthly" | "annual">(() => {
    const saved = localStorage.getItem("pricing_billing");
    return (saved as "monthly" | "annual") || "monthly";
  });

  const [addOns, setAddOns] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("pricing_addOns") || "[]");
    } catch {
      return [];
    }
  });

  const [aiOpsLevel, setAiOpsLevel] = useState<AiOpsKey>(() => {
    const saved = localStorage.getItem("pricing_aiOpsLevel");
    return VALID_AI_KEYS.includes(saved as AiOpsKey) ? (saved as AiOpsKey) : "none";
  });

  const [pricingMode, setPricingMode] = useState<PricingMode>(() => {
    return (localStorage.getItem("pricing_mode") as PricingMode) || "retainer";
  });

  const [selectedProjects, setSelectedProjects] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("pricing_projects") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pricing_tier", tier);
    localStorage.setItem("pricing_billing", billing);
    localStorage.setItem("pricing_addOns", JSON.stringify(addOns));
    localStorage.setItem("pricing_aiOpsLevel", aiOpsLevel);
    localStorage.setItem("pricing_mode", pricingMode);
    localStorage.setItem("pricing_projects", JSON.stringify(selectedProjects));
  }, [tier, billing, addOns, aiOpsLevel, pricingMode, selectedProjects]);

  return {
    tier,
    setTier,
    billing,
    setBilling,
    addOns,
    setAddOns,
    aiOpsLevel,
    setAiOpsLevel,
    pricingMode,
    setPricingMode,
    selectedProjects,
    setSelectedProjects,
  };
}
