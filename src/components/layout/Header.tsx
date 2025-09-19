import { ArrowLeft, Bell, Calendar, Home, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRole } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  userName: string;
  userRole: UserRole;
  onMenuClick: () => void;
  onLogout: () => Promise<void>;
}

export const Header = ({ userName, userRole, onMenuClick, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    window.history.back();
  };
  
  const handleHome = () => {
    navigate('/dashboard');
  };
  
  const isOnDashboard = location.pathname === '/dashboard';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Back Button */}
          {!isOnDashboard && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-accent/10"
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHome}
            className="hover:bg-accent/10"
            disabled={isOnDashboard}
            title="Go to Dashboard"
          >
            <Home className="h-5 w-5" />
          </Button>
          
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent ml-2">
            Smart Curriculum
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Calendar className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" alt={userName} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {userRole}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};