import { Metadata } from "next";
import { MediaClient } from "@/components/features/dashboard/media-client";

export const metadata: Metadata = {
  title: "Collateral | Concepful Dashboard",
  description: "Documents and assets across all projects.",
};

export default function CollateralPage() {
  return <MediaClient />;
}
