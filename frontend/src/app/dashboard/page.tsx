"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PlusCircle, Clock, MapPin, SearchX, LogOut, User,
  Loader2, RefreshCw, LayoutDashboard, Bell, Settings,
  FileText, CheckCircle2, AlertCircle, Timer, Activity, ArrowRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  SUBMITTED:   { label: "Submitted",   color: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",       icon: <FileText className="w-3.5 h-3.5" /> },
  VERIFIED:    { label: "Verified",    color: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",    icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ASSIGNED:    { label: "Assigned",    color: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",          icon: <User className="w-3.5 h-3.5" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-600/10 text-blue-600 border-blue-600/20 dark:text-blue-400",          icon: <Timer className="w-3.5 h-3.5" /> },
  RESOLVED:    { label: "Resolved",    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CLOSED:      { label: "Closed",      color: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",       icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED:    { label: "Rejected",    color: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",             icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-orange-500 shadow-orange-500/50 shadow-sm",
  CRITICAL: "bg-red-500 shadow-red-500/50 shadow-sm animate-pulse",
};

const DEMO_DATA = [
  { id: "complaint-1", title: "Large Pothole on Market Road", category: "Pothole", status: "IN_PROGRESS", priority: "HIGH", createdAt: "2026-07-30T00:00:00Z", address: "Market Road, Amalner" },
  { id: "complaint-2", title: "Garbage overflow near bus stand", category: "Garbage", status: "SUBMITTED", priority: "MEDIUM", createdAt: "2026-07-31T00:00:00Z", address: "Bus Stand, Amalner" },
  { id: "complaint-3", title: "Street light not working on Station Road", category: "Street Light", status: "RESOLVED", priority: "LOW", createdAt: "2026-07-29T00:00:00Z", address: "Station Road, Amalner" },
];

import { Variants } from "framer-motion";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setIsDemo(false);
    try {
      const res = await api.get("/complaints");
      setComplaints(res.data?.complaints || res.data || []);
    } catch {
      setIsDemo(true);
      setComplaints(DEMO_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const active = complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED");
  const resolved = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
  const shown = activeTab === "active" ? active : resolved;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.name?.split(" ")[0] || "Citizen";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">CivicSync AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-2 bg-card border border-border px-3 py-1.5 rounded-full">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{user.name?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium pr-1">{user.name}</span>
            </div>
            <Link href="/profile">
              <button className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 sm:px-6 py-8 pb-28 sm:pb-12 flex-1 w-full">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
          
          {/* Demo data banner */}
          {isDemo && (
            <motion.div variants={fadeUp} className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Backend offline — showing demo data. Start the backend server to see real complaints.</span>
            </motion.div>
          )}

          {/* Welcome Banner */}
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] bg-card border border-border shadow-sm p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> {greeting},
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{firstName} 👋</h1>
                <p className="text-muted-foreground text-base">
                  {complaints.length === 0
                    ? "You haven't reported any issues yet."
                    : `You have ${active.length} active ${active.length === 1 ? "issue" : "issues"} requiring attention.`}
                </p>
              </div>
              <Link href="/report">
                <Button className="rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 h-14 px-8 flex-shrink-0 gap-2 hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
                  <PlusCircle className="w-5 h-5" />
                  <span>Report New Issue</span>
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total Reports", value: complaints.length, color: "text-foreground", bg: "bg-card border-border shadow-sm" },
              { label: "Active", value: active.length, color: "text-blue-500", bg: "bg-blue-500/5 border-blue-500/10" },
              { label: "Resolved", value: resolved.length, color: "text-emerald-500", bg: "bg-emerald-500/5 border-emerald-500/10" },
            ].map((s, i) => (
              <div key={s.label} className={`${s.bg} border rounded-3xl p-5 sm:p-6 text-center ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
                <p className={`text-4xl font-black ${s.color} mb-1 tracking-tighter`}>{s.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Tabs & List */}
          <motion.div variants={fadeUp} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-2 bg-card border border-border rounded-full p-1.5 shadow-sm inline-flex">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "active" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                >
                  Active ({active.length})
                </button>
                <button
                  onClick={() => setActiveTab("resolved")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "resolved" ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                >
                  Resolved ({resolved.length})
                </button>
              </div>
              <button
                onClick={fetchComplaints}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-accent text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Complaint List */}
            <div className="min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[300px] gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm font-medium">Syncing data...</p>
                </div>
              ) : shown.length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid gap-4">
                    {shown.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <ComplaintCard complaint={c} />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-2xl border-t border-border sm:hidden z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 px-2 py-3">
          {[
            { href: "/dashboard", icon: <LayoutDashboard className="w-6 h-6" />, label: "Home", active: true },
            { href: "/report", icon: <PlusCircle className="w-6 h-6" />, label: "Report", active: false },
            { href: "#", icon: <Bell className="w-6 h-6" />, label: "Alerts", active: false },
            { href: "/profile", icon: <User className="w-6 h-6" />, label: "Profile", active: false },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 py-1 rounded-2xl transition-colors ${item.active ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-accent"}`}>
              {item.icon}
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComplaintCard({ complaint }: { complaint: any }) {
  const date = new Date(complaint.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const shortId = complaint.id?.slice(-6).toUpperCase();
  const statusConf = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.SUBMITTED;

  return (
    <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${statusConf.color}`}>
              {statusConf.icon}
              {statusConf.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono bg-accent px-2 py-1.5 rounded-md font-semibold">#{shortId}</span>
          </div>
          {complaint.priority && (
            <div className="flex items-center gap-2 flex-shrink-0 bg-background border border-border px-2.5 py-1.5 rounded-full shadow-sm">
              <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[complaint.priority] || "bg-slate-400"}`}></span>
              <span className="text-[11px] font-bold tracking-wide uppercase text-foreground">{complaint.priority}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">{complaint.title}</h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground font-medium">
          {complaint.address && (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span className="truncate max-w-[240px]">{complaint.address}</span>
            </span>
          )}
          <span className="flex items-center gap-2 flex-shrink-0">
            <Clock className="w-4 h-4 text-primary/70" />
            {date}
          </span>
        </div>

        {complaint.category && (
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs font-bold bg-accent/50 text-foreground px-3 py-1.5 rounded-full border border-border shadow-sm">
              {complaint.category}
            </span>
            <div className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
              View Details <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: "active" | "resolved" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full min-h-[320px] rounded-[2rem] border-2 border-dashed border-border bg-card/30 flex flex-col items-center justify-center text-center p-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent border border-border flex items-center justify-center mb-5 shadow-sm">
        <SearchX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">
        {tab === "active" ? "No active complaints" : "No resolved complaints yet"}
      </h3>
      <p className="text-muted-foreground text-base max-w-sm mx-auto mb-8 font-medium leading-relaxed">
        {tab === "active"
          ? "Spot a problem in your neighborhood? Report it in under 30 seconds."
          : "Your resolved complaints will appear here."}
      </p>
      {tab === "active" && (
        <Link href="/report">
          <Button className="rounded-full font-bold shadow-lg shadow-primary/20 h-12 px-8 gap-2">
            <PlusCircle className="w-5 h-5" /> Report an Issue
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
