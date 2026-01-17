import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Records from "@/pages/Records";
import Analytics from "@/pages/Analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/records" component={Records} />
      <Route path="/analytics" component={Analytics} />
      
      {/* Redirect /records/:id to records page handling query params internally or simple redirect for now */}
      <Route path="/records/:id">
        {(params) => <Redirect to={`/records`} />} 
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
