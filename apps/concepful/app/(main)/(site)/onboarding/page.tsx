import { Metadata } from "next";
import { OnboardingClient } from "@/components/features/onboarding/onboarding-client";

export const metadata: Metadata = {
  title: "Onboarding | Concepful",
  description: "Set up your brand and preferences.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
