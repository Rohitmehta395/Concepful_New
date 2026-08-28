import { Metadata } from "next";
import { CheckoutClient } from "@/components/features/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout | Concepful",
  description: "Complete your purchase and start building your creative engine.",
};

export default function CheckoutPage() {
  return (
    <div className="flex-1 min-h-screen">
      <CheckoutClient />
    </div>
  );
}
