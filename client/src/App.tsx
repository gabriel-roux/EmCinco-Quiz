import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Quiz = lazy(() => import("@/pages/Quiz"));
const Processing = lazy(() => import("@/pages/Processing"));
const Result = lazy(() => import("@/pages/Result"));
const ResultFinal = lazy(() => import("@/pages/ResultFinal"));
const ResultBackOffer = lazy(() => import("@/pages/ResultBackOffer"));
const Success = lazy(() => import("@/pages/Success"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Quiz} />
        <Route path="/processing" component={Processing} />
        <Route path="/result" component={Result} />
        <Route path="/result-final" component={ResultFinal} />
        <Route path="/result-back-offer" component={ResultBackOffer} />
        <Route path="/success" component={Success} />
        <Route
          path="/login"
          component={() =>
            (window.location.href = "https://app.emcinco.com/login")
          }
        />
        <Route path="/quiz">{() => <Quiz />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export default App;
