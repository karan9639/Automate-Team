"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Briefcase, Users, Zap } from "lucide-react";
import { loginUser } from "@/api/authApi";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      const res = await loginUser({
        email: email.toLowerCase(),
        password,
      });

      if (res.data?.success === true && res.data?.statusCode === 200) {
        const apiUserData = res.data.data; // This is the object containing all user details

        // Ensure all fields from apiUserData are included in the user object for AuthContext
        // The simplest way is to spread apiUserData and then add/override specific fields if needed.
        const user = {
          ...apiUserData, // Spread all fields from the API response's data object
          id: apiUserData.id || apiUserData._id || apiUserData.email, // Use email as a fallback ID if not present
          name: apiUserData.fullname, // Keep 'name' if used elsewhere, though 'fullname' is primary
          role: apiUserData.accountType, // Keep 'role' if used elsewhere, though 'accountType' is primary
          joinDate: apiUserData.createdAt, // Standardize joinDate from createdAt
        };

        // Remove any fields from user object that are not part of your desired user model for the context, if necessary.
        // For example, if your API returns extra temporary fields.
        // In this case, we want to keep everything.

        const token =
          res.data.token || res.data.accessToken || "demo-token-" + Date.now();

        console.log("LoginPage: User object being sent to AuthContext:", user);
        await login(user, token); // Pass the complete user object

        toast.success("Logged In Successfully!");
        navigate(from, { replace: true });
      } else {
        const errorMessage =
          res.data?.message || "Invalid email or password. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      let errorMessage =
        "Login failed. Please check your credentials and try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 font-sans">
      {/* Left Column - Descriptive Text */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-green-500 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center space-y-8">
          <Link to="/" className="inline-block">
            <AutomateLogo className="h-16 w-auto text-white" />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">
            Elevate Your Workflow with KPS Automate Task
          </h1>
          <p className="text-lg leading-relaxed text-green-100">
            Transform your team's productivity with KPS Automate Task, the
            intelligent solution for seamless project management and workflow
            automation. Our platform offers intuitive task delegation, real-time
            progress tracking, and insightful analytics, all designed to
            simplify complexity and foster collaboration. Step into a more
            efficient future where every task is a step towards success. Join
            KPS Automate Task and redefine your team's potential.
          </p>
          <div className="flex justify-center space-x-6 pt-4">
            <div className="flex flex-col items-center">
              <Briefcase className="h-10 w-10 text-green-300 mb-2" />
              <span className="font-medium">Project Management</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-10 w-10 text-green-300 mb-2" />
              <span className="font-medium">Team Collaboration</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-10 w-10 text-green-300 mb-2" />
              <span className="font-medium">Workflow Automation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 h-screen">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block mx-auto">
              <AutomateLogo className="h-12 w-auto text-green-600" />
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back!
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to continue to KPS Automate Task.
            </p>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="text-slate-700">
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
                className="mt-1 block w-full px-3 py-2.5 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-sm font-medium text-green-600 hover:text-green-500 hover:underline"
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
                  className="block w-full px-3 py-2.5 pr-10 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-400 hover:text-green-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 transition-colors duration-150"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600">
              Don't have an account?{" "}
              <Link
                to={ROUTES.AUTH.SIGNUP}
                className="font-medium text-green-600 hover:text-green-500 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
