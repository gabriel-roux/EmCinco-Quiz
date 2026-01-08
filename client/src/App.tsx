import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initFacebookPixel } from "./lib/facebookPixel";

import Quiz from "@/pages/Quiz";
import Processing from "@/pages/Processing";
import Result from "@/pages/Result";
import ResultFinal from "@/pages/ResultFinal";
import Success from "@/pages/Success";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Quiz} />
      <Route path="/processing" component={Processing} />
      <Route path="/result" component={Result} />
      <Route path="/result-final" component={ResultFinal} />
      <Route path="/success" component={Success} />
      {/* Quiz handles its own internal routing via state, but we route /quiz back to home to reset if needed */}
      <Route path="/quiz">
        {() => <Quiz />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
