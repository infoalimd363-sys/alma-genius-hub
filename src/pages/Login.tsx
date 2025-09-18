import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignupClick = () => {
    setIsSignup(true);
  };

  const handleLoginClick = () => {
    setIsSignup(false);
  };

  return isSignup ? (
    <SignupForm onLoginClick={handleLoginClick} />
  ) : (
    <LoginForm onLogin={handleLogin} onSignupClick={handleSignupClick} />
  );
};

export default Login;