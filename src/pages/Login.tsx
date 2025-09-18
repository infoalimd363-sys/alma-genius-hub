import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // This will be replaced with actual Supabase auth
    console.log("Login attempt:", { email, password });
    
    // Simulate successful login
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
    
    // Navigate to dashboard
    navigate("/dashboard");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return <LoginForm onLogin={handleLogin} onSignupClick={handleSignupClick} />;
};

export default Login;