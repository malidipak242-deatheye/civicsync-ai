"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const { role } = await login(email, password);
      if (role === "SUPER_ADMIN" || role === "DEPARTMENT_MANAGER") {
        router.push("/admin");
      } else if (role === "WORKER") {
        router.push("/worker");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: "citizen" | "admin" | "worker") => {
    const creds = {
      citizen: { email: "citizen@example.com", password: "password123" },
      admin: { email: "admin@amalner.gov.in", password: "password123" },
      worker: { email: "worker@amalner.gov.in", password: "password123" },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-5 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            CivicSync <span className="text-primary">AI</span>
          </span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm bg-card/80 border border-border rounded-[2.5rem] shadow-2xl backdrop-blur-3xl p-8 relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">Sign in to your account</p>
        </div>

        {/* Quick Login Buttons */}
        <div className="mb-6">
          <p className="text-[10px] text-muted-foreground text-center mb-3 uppercase tracking-widest font-bold">
            Demo Quick Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["citizen", "admin", "worker"] as const).map((role) => (
              <button
                key={role}
                onClick={() => fillDemo(role)}
                className="py-2.5 px-2 rounded-xl border border-border bg-background hover:bg-accent hover:border-primary/50 text-[11px] text-muted-foreground hover:text-foreground font-bold capitalize transition-all"
              >
                {role === "admin" ? "🏛️" : role === "worker" ? "🔧" : "👤"} {role}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-6 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground text-xs font-bold uppercase tracking-wide ml-1">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-background border-border h-12 rounded-xl px-4 shadow-sm focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground text-xs font-bold uppercase tracking-wide ml-1">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-background border-border h-12 rounded-xl px-4 shadow-sm focus-visible:ring-primary pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-full text-base shadow-xl shadow-primary/20 mt-2 transition-transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Authenticating...</>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
            Sign up free
          </Link>
        </p>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-muted-foreground/60 mt-8 text-center font-medium">
        © 2026 CivicSync AI · Amalner Municipal Council
      </motion.p>
    </div>
  );
}
