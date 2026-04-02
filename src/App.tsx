import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "./pages/home";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "@/pages/StudentDashboard";
import PlacementCellDashboard from "@/pages/PlacementCellDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

import { DashboardLayout } from "@/components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* ✅ PUBLIC PAGES (NO SIDEBAR) */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* ✅ DASHBOARD PAGES */}
          <Route
            path="/student"
            element={
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/placement-cell"
            element={
              <DashboardLayout>
                <PlacementCellDashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin"
            element={
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            }
          />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;