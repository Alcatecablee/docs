import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import SkipNavigation from "./components/SkipNavigation";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import DashboardNew from "./pages/DashboardNew";
import Pricing from "./pages/Pricing";
import Activity from "./pages/Activity";
import GenerationProgress from "./pages/GenerationProgress";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SkipNavigation />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<DashboardNew />} />
          <Route path="/dashboard/old" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/generate/:sessionId" element={<GenerationProgress />} />
          <Route path="/generation/:sessionId" element={<GenerationProgress />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
