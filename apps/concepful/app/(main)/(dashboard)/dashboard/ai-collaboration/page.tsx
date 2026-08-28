import { Metadata } from "next";
import { AiCollaborationClient } from "@/components/features/dashboard/ai-collaboration-client";

export const metadata: Metadata = {
  title: "AI Collaboration | Concepful Dashboard",
  description: "Configure orchestration rules and model integration.",
};

export default function AiCollaborationPage() {
  return <AiCollaborationClient />;
}
