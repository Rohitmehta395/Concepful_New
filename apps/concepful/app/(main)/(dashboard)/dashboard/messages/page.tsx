import { Metadata } from "next";
import { MessagesClient } from "@/components/features/dashboard/messages-client";

export const metadata: Metadata = {
  title: "Messages | Concepful Dashboard",
  description: "View your conversations, notes, and follow-ups.",
};

export default function MessagesPage() {
  return <MessagesClient />;
}
