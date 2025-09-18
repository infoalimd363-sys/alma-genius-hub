import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AttendanceTracker } from "./components/attendance/AttendanceTracker";
import { TaskManager } from "./components/tasks/TaskManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<AttendanceTracker />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/routine" element={<Dashboard />} />
          <Route path="/grades" element={<Dashboard />} />
          <Route path="/mark-attendance" element={<Dashboard />} />
          <Route path="/manage-grades" element={<Dashboard />} />
          <Route path="/assign-tasks" element={<Dashboard />} />
          <Route path="/students" element={<Dashboard />} />
          <Route path="/users" element={<Dashboard />} />
          <Route path="/schedules" element={<Dashboard />} />
          <Route path="/reports" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
