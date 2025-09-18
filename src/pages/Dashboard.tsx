import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  
  const userRole = profile?.role || "student";
  const userName = profile?.full_name || "User";

  const handleLogout = async () => {
    await signOut();
  };

  const renderDashboard = () => {
    switch (userRole) {
      case "student":
        return <StudentDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={userName}
        userRole={userRole}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />
      <div className="flex">
        <Sidebar userRole={userRole} isOpen={sidebarOpen} />
        <main className="flex-1 md:ml-64">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;