import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n";
import { lazy, Suspense } from "react";
import Welcome from "@/pages/Welcome";

const Quiz = lazy(() => import("@/pages/Quiz"));
const Processing = lazy(() => import("@/pages/Processing"));
const Result = lazy(() => import("@/pages/Result"));
const ResultFinal = lazy(() => import("@/pages/ResultFinal"));
const ResultBackOffer = lazy(() => import("@/pages/ResultBackOffer"));
const Success = lazy(() => import("@/pages/Success"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/quiz">
        <Suspense fallback={<PageLoader />}>
          <Quiz />
        </Suspense>
      </Route>
      <Route path="/processing">
        <Suspense fallback={<PageLoader />}>
          <Processing />
        </Suspense>
      </Route>
      <Route path="/result">
        <Suspense fallback={<PageLoader />}>
          <Result />
        </Suspense>
      </Route>
      <Route path="/result-final">
        <Suspense fallback={<PageLoader />}>
          <ResultFinal />
        </Suspense>
      </Route>
      <Route path="/result-back-offer">
        <Suspense fallback={<PageLoader />}>
          <ResultBackOffer />
        </Suspense>
      </Route>
      <Route path="/success">
        <Suspense fallback={<PageLoader />}>
          <Success />
        </Suspense>
      </Route>
      <Route
        path="/login"
        component={() =>
          (window.location.href = "https://app.emcinco.com/login")
        }
      />
      <Route>
        <Suspense fallback={<PageLoader />}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
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
