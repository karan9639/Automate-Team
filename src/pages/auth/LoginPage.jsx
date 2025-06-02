"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Briefcase, Users, Zap, AlertCircle } from "lucide-react";
import { loginUser } from "@/api/authApi";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Assuming Label is styled or basic
import AutomateLogo from "@/components/common/AutomateLogo";
import { ROUTES } from "@/constants/routes";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD.HOME;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await loginUser({ email: email.toLowerCase(), password });
      if (res.data?.success === true && res.data?.statusCode === 200) {
        const apiUserData = res.data.data;
        const user = {
          ...apiUserData,
          id: apiUserData.id || apiUserData._id || apiUserData.email,
          name: apiUserData.fullname,
          role: apiUserData.accountType,
          joinDate: apiUserData.createdAt,
        };
        const token =
          res.data.token || res.data.accessToken || `demo-token-${Date.now()}`;
        await login(user, token);
        toast.success("Logged In Successfully!");
        navigate(from, { replace: true });
      } else {
        const errorMessage = res.data?.message || "Invalid email or password.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 font-sans">
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center space-y-10 max-w-lg">
          <Link to="/" className="inline-block">
            <AutomateLogo className="h-14 w-auto text-white drop-shadow-lg" />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            Streamline Your Success with Jasmine Automate Task
          </h1>
          <p className="text-lg leading-relaxed text-primary-foreground/80 text-balance">
            Unlock peak productivity with intuitive task management, real-time
            collaboration, and insightful analytics. Jasmine Automate empowers
            your team to achieve more, effortlessly.
          </p>
          <div className="flex justify-center space-x-8 pt-6">
            {[
              { icon: Briefcase, label: "Project Mastery" },
              { icon: Users, label: "Team Synergy" },
              { icon: Zap, label: "Workflow Automation" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center space-y-2"
              >
                <item.icon className="h-10 w-10 text-primary-foreground/70" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-block mx-auto">
              <AutomateLogo className="h-10 w-auto text-primary" />
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome Back!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your dashboard.
            </p>
          </div>

          {error && (
            <div
              className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg flex items-start space-x-2 text-sm"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Login Error:</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-sm font-medium text-primary hover:text-primary/90 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1} // Makes it not focusable with Tab
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-base py-2.5"
              size="lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to={ROUTES.AUTH.SIGNUP}
              className="font-medium text-primary hover:text-primary/90 hover:underline"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
