import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StudentGrades } from "@/components/grades/StudentGrades";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Grades = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          userRole={profile?.role || "student"}
          isOpen={sidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            userName={profile?.full_name || "User"}
            userRole={profile?.role || "student"}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto bg-background">
            <StudentGrades />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Grades;