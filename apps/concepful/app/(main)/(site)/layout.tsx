import { SiteLayout } from "@/components/layout/site-layout";

export default function SiteRouteLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
