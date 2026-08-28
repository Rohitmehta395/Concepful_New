import { Metadata } from "next";
import { ThankYouClient } from "@/components/features/checkout/thank-you-client";

export const metadata: Metadata = {
  title: "Thank You | Concepful",
  description: "Purchase confirmed. Welcome to Concepful.",
};

export default function ThankYouPage() {
  return (
    <div className="flex-1 min-h-screen">
      <ThankYouClient />
    </div>
  );
}
