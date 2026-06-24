import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuthState } from "@/hooks/use-auth-state";

import Landing from "@/pages/landing";
import PricingBreakdown from "@/pages/pricing";
import Checkout from "@/pages/checkout";
import ThankYou from "@/pages/thank-you";
import Onboarding from "@/pages/onboarding";
import WorkIndex from "@/pages/work/index";
import CaseStudy from "@/pages/work/case-study";
import DashboardOverview from "@/pages/dashboard/index";
import Requests from "@/pages/dashboard/requests";
import History from "@/pages/dashboard/history";
import BrandCenter from "@/pages/dashboard/brand";
import BrandCheck from "@/pages/dashboard/brand-check";
import AiCollaboration from "@/pages/dashboard/ai-collaboration";
import ProjectCard from "@/pages/dashboard/project";
import AccountSettings from "@/pages/dashboard/settings";
import CalendarPage from "@/pages/dashboard/calendar";
import Messages from "@/pages/dashboard/messages";
import MediaPage from "@/pages/dashboard/media-page";
import AdminDashboard from "@/pages/admin/index";
import Leads from "@/pages/admin/leads";
import AdminPortfolio from "@/pages/admin/portfolio";
import AdminBlog from "@/pages/admin/blog";
import AdminCrm from "@/pages/admin/crm";

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuthState();
  if (!isAdmin) return <Redirect to="/" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/work" component={WorkIndex} />
      <Route path="/work/:slug" component={CaseStudy} />
      <Route path="/pricing" component={PricingBreakdown} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/onboarding" component={Onboarding} />
      
      <Route path="/dashboard" component={DashboardOverview} />
      <Route path="/dashboard/requests" component={Requests} />
      <Route path="/dashboard/history" component={History} />
      <Route path="/dashboard/brand" component={BrandCenter} />
      <Route path="/dashboard/project/:id" component={ProjectCard} />
      <Route path="/dashboard/brand-check" component={BrandCheck} />
      <Route path="/dashboard/ai-collaboration" component={AiCollaboration} />
      <Route path="/dashboard/settings" component={AccountSettings} />
      <Route path="/dashboard/calendar" component={CalendarPage} />
      <Route path="/dashboard/messages" component={Messages} />
      <Route path="/dashboard/collateral" component={MediaPage} />
      <Route path="/dashboard/media" component={MediaPage} />

      <Route path="/admin">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/leads">
        <AdminGuard><Leads /></AdminGuard>
      </Route>
      <Route path="/admin/portfolio">
        <AdminGuard><AdminPortfolio /></AdminGuard>
      </Route>
      <Route path="/admin/blog">
        <AdminGuard><AdminBlog /></AdminGuard>
      </Route>
      <Route path="/admin/crm">
        <AdminGuard><AdminCrm /></AdminGuard>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
