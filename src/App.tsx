import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/home";
import AuthPage from "./pages/AuthPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import StudentDashboard from "@/pages/StudentDashboard";
import PlacementCellDashboard from "@/pages/PlacementCellDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
          
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* ✅ ADD THIS */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/placement-cell" element={<PlacementCellDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="*" element={<NotFound />} />
         
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
