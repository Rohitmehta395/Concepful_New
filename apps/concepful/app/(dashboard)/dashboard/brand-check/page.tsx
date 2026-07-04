import { Metadata } from "next";
import { BrandCheckClient } from "@/components/features/dashboard/brand-check-client";

export const metadata: Metadata = {
  title: "Brand Check | Concepful Dashboard",
  description: "Automated compliance scoring against your brand intelligence profile.",
};

export default function BrandCheckPage() {
  return <BrandCheckClient />;
}
