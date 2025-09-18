import { 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  GraduationCap, 
  Home, 
  LayoutDashboard, 
  ListTodo, 
  Settings, 
  Users,
  BarChart3,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
}

const menuItems = {
  student: [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "Daily Routine", path: "/routine" },
    { icon: CheckSquare, label: "Attendance", path: "/attendance" },
    { icon: GraduationCap, label: "Grades", path: "/grades" },
    { icon: ListTodo, label: "Tasks", path: "/tasks" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ClipboardCheck, label: "Mark Attendance", path: "/mark-attendance" },
    { icon: BookOpen, label: "Manage Grades", path: "/manage-grades" },
    { icon: ListTodo, label: "Assign Tasks", path: "/assign-tasks" },
    { icon: Users, label: "Students", path: "/students" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Users", path: "/users" },
    { icon: CheckSquare, label: "Attendance", path: "/attendance" },
    { icon: BookOpen, label: "Grades", path: "/grades" },
    { icon: Calendar, label: "Schedules", path: "/schedules" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ],
};

export const Sidebar = ({ userRole, isOpen }: SidebarProps) => {
  const location = useLocation();
  const items = menuItems[userRole];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-border bg-background transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      <nav className="flex flex-col gap-2 p-4">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-gradient-primary text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};