import { Metadata } from "next";
import { CalendarClient } from "@/components/features/dashboard/calendar-client";

export const metadata: Metadata = {
  title: "Calendar | Concepful Dashboard",
  description: "View scheduled items and upcoming events.",
};

export default function CalendarPage() {
  return <CalendarClient />;
}
