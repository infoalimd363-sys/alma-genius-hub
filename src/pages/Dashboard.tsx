import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { UserRole } from "@/types";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // This will be replaced with actual auth state from Supabase
  const [userRole] = useState<UserRole>("student");
  const userName = "John Doe";

  const handleLogout = () => {
    // Implement logout logic
    console.log("Logging out...");
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