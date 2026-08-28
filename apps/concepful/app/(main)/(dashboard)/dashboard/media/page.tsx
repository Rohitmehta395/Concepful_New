import { Metadata } from "next";
import { MediaClient } from "@/components/features/dashboard/media-client";

export const metadata: Metadata = {
  title: "Media | Concepful Dashboard",
  description: "Documents and assets across all projects.",
};

export default function MediaPage() {
  return <MediaClient />;
}
