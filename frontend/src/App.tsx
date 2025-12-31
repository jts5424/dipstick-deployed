import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AddVehicle from "@/pages/add";
import VehicleReport from "@/pages/report";
import Compare from "@/pages/compare";
import DemoPage from "@/pages/demo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/add" component={AddVehicle} />
      <Route path="/report/:id" component={VehicleReport} />
      <Route path="/compare" component={Compare} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/demo/:id" component={DemoPage} />
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
