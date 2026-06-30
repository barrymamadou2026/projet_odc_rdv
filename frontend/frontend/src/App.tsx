import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, RequireRole } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import AppointmentDetails from "./pages/AppointmentDetails";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import FindDoctors from "./pages/FindDoctors";
import Help from "./pages/Help";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/appointments/:id" element={<RequireRole><AppointmentDetails /></RequireRole>} />
              <Route path="/patient" element={<RequireRole role="PATIENT"><PatientDashboard /></RequireRole>} />
              <Route path="/doctor" element={<RequireRole role="MEDECIN"><DoctorDashboard /></RequireRole>} />
              <Route path="/admin" element={<RequireRole role="ADMIN"><AdminDashboard /></RequireRole>} />
              <Route path="/appointments" element={<RequireRole><Appointments /></RequireRole>} />
              <Route path="/records" element={<RequireRole><MedicalRecords /></RequireRole>} />
              <Route path="/find-doctors" element={<RequireRole><FindDoctors /></RequireRole>} />
              <Route path="/settings" element={<RequireRole><Settings /></RequireRole>} />
              <Route path="/messages" element={<RequireRole><Messages /></RequireRole>} />
              <Route path="/help" element={<Help />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
