import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import BrokerPresentation from "@/pages/broker-presentation";
import AdminPage from "@/pages/admin";
import ComingSoon from "@/pages/coming-soon";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/broker/:slug" component={BrokerPresentation} />
      <Route path="/agent/:slug" component={ComingSoon} />
      <Route path="/title/:slug" component={ComingSoon} />
      <Route path="/escrow/:slug" component={ComingSoon} />
      <Route path="/hard-money/:slug" component={ComingSoon} />
      <Route path="/technology-partner/:slug" component={ComingSoon} />
      <Route path="/service-provider/:slug" component={ComingSoon} />
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
