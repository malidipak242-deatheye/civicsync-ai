"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import {
  Users, FileText, CheckCircle, Clock, Loader2, Search,
  MapPin, LogOut, AlertCircle, RefreshCw, Shield, Filter,
  TrendingUp, BarChart2, Activity, Settings, ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED:   "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
  VERIFIED:    "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  ASSIGNED:    "bg-blue-400/10 text-blue-600 border-blue-400/20 dark:text-blue-400",
  IN_PROGRESS: "bg-blue-600/10 text-blue-700 border-blue-600/20 dark:text-blue-500",
  RESOLVED:    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  CLOSED:      "bg-slate-600/10 text-slate-600 border-slate-600/20 dark:text-slate-400",
  REJECTED:    "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

const STATUS_COLORS_HEX: Record<string, string> = {
  SUBMITTED: "#64748b",
  VERIFIED: "#a855f7",
  ASSIGNED: "#60a5fa",
  IN_PROGRESS: "#2563eb",
  RESOLVED: "#10b981",
  CLOSED: "#475569",
  REJECTED: "#ef4444",
};

const CATEGORY_CHART_DATA = [
  { name: "Potholes", value: 0 },
  { name: "Garbage", value: 0 },
  { name: "Street Lights", value: 0 },
  { name: "Water", value: 0 },
  { name: "Drainage", value: 0 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, submitted: 0, resolutionRate: 0 });
  const [complaints, setComplaints] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"overview" | "complaints">("overview");
  const [chartData, setChartData] = useState(CATEGORY_CHART_DATA);
  const [statusChartData, setStatusChartData] = useState<{name: string, value: number}[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "SUPER_ADMIN" && user.role !== "DEPARTMENT_MANAGER") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, complaintsRes, workersRes] = await Promise.all([
        api.get("/complaints/stats").catch(() => ({ data: null })),
        api.get("/complaints").catch(() => ({ data: [] })),
        api.get("/users/workers").catch(() => ({ data: [] }))
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (workersRes.data) setWorkers(workersRes.data);

      const data = complaintsRes.data?.complaints || complaintsRes.data || [];
      setComplaints(data);
      setFiltered(data);

      const catMap: Record<string, number> = {};
      data.forEach((c: any) => {
        const cat = c.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      if (Object.keys(catMap).length > 0) {
        setChartData(
          Object.entries(catMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, value]) => ({ name, value }))
        );
      }

      const statusMap: Record<string, number> = {};
      data.forEach((c: any) => {
        const stat = c.status || "SUBMITTED";
        statusMap[stat] = (statusMap[stat] || 0) + 1;
      });
      if (Object.keys(statusMap).length > 0) {
        setStatusChartData(
          Object.entries(statusMap).map(([name, value]) => ({ name, value }))
        );
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleAssignWorker = async (complaintId: string, workerId: string) => {
    try {
      await api.patch(`/complaints/${complaintId}/assign`, { workerId });
      fetchData(); // Refresh the data to show updated status
    } catch (err) {
      console.error("Failed to assign worker", err);
      alert("Failed to assign worker. Please try again.");
    }
  };

  useEffect(() => {
    if (user && (user.role === "SUPER_ADMIN" || user.role === "DEPARTMENT_MANAGER")) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    let result = complaints;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, complaints]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "DEPARTMENT_MANAGER")) {
    return null;
  }

  const statCards = [
    { title: "Total Issues", value: stats.total, icon: <FileText className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { title: "Resolved", value: stats.resolved, icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { title: "In Progress", value: stats.inProgress, icon: <Activity className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    { title: "Resolution Rate", value: `${stats.resolutionRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight">Workspace</h1>
              <p className="text-xs text-muted-foreground font-medium">Amalner Council</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-border">
              <div className="text-right">
                <p className="text-sm font-bold leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role === "SUPER_ADMIN" ? "Administrator" : "Manager"}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-accent border border-border flex items-center justify-center">
                <span className="text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
              </div>
            </div>
            
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-1">Command Center</h2>
            <p className="text-muted-foreground font-medium">Overview of municipal operations and citizen reports.</p>
          </div>
          
          {/* Tab Navigation (Pill style) */}
          <div className="flex bg-accent/50 p-1 rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab("overview")}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === "overview" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "overview" && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-background rounded-xl border border-border shadow-sm" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Overview
              </span>
            </button>
            <button
              onClick={() => setActiveTab("complaints")}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === "complaints" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "complaints" && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-background rounded-xl border border-border shadow-sm" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Issues
                <Badge className="ml-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{complaints.length}</Badge>
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((s, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    key={s.title} 
                    className="bg-card border border-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${s.color}`}>
                      {s.icon}
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                      <span className={s.color}>{s.icon}</span>
                    </div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">{s.title}</p>
                    <p className="text-3xl font-black">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold">Issue Distribution</h3>
                      <p className="text-sm text-muted-foreground">Breakdown by category</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-[300px]">
                    {chartData.some((d) => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip
                            cursor={{ fill: "hsl(var(--accent))" }}
                            contentStyle={{
                              background: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "16px",
                              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                              color: "hsl(var(--popover-foreground))",
                              fontWeight: "bold"
                            }}
                          />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                        <BarChart2 className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No analytical data available.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Distribution Chart Section */}
                <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold">Status Overview</h3>
                      <p className="text-sm text-muted-foreground">Current states</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-[300px]">
                    {statusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS_HEX[entry.name] || "#8884d8"} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              background: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "16px",
                              color: "hsl(var(--popover-foreground))",
                              fontWeight: "bold"
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                        <Activity className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No analytical data available.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 flex items-center justify-between">
                      Team Management <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </h3>
                    <p className="text-sm text-muted-foreground">Manage field workers and departmental access.</p>
                  </div>

                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 flex items-center justify-between">
                      Geographic View <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </h3>
                    <p className="text-sm text-muted-foreground">View real-time incident mapping across the city.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "complaints" && (
            <motion.div
              key="complaints"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search issues, categories, or locations..."
                    className="pl-11 h-12 bg-background border-border rounded-2xl shadow-sm text-sm"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {["ALL", "SUBMITTED", "IN_PROGRESS", "RESOLVED", "REJECTED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        statusFilter === s
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table Area */}
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border bg-accent/30 flex justify-between items-center">
                  <h3 className="font-bold">Recent Issues</h3>
                  <Badge variant="outline" className="font-bold border-border">{filtered.length} Results</Badge>
                </div>

                {filtered.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">No results found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      We couldn't find any complaints matching your current filters. Try adjusting your search criteria.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filtered.map((c) => (
                      <AdminComplaintRow key={c.id} complaint={c} workers={workers} onAssign={handleAssignWorker} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function AdminComplaintRow({ complaint, workers, onAssign }: { complaint: any, workers: any[], onAssign: (id: string, workerId: string) => void }) {
  const date = new Date(complaint.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const shortId = complaint.id?.slice(-6).toUpperCase();

  return (
    <div className="p-5 hover:bg-accent/50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-bold font-mono text-muted-foreground bg-accent px-2 py-1 rounded-md">
            #{shortId}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[complaint.status] || STATUS_COLORS.SUBMITTED}`}>
            {complaint.status?.replace("_", " ")}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${PRIORITY_COLORS[complaint.priority] || PRIORITY_COLORS.LOW}`}>
            {complaint.priority}
          </span>
        </div>
        
        <h4 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {complaint.title}
        </h4>
        
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5 bg-background border border-border px-2 py-1 rounded-md">
            {complaint.category}
          </span>
          {complaint.address && (
            <span className="flex items-center gap-1.5 truncate max-w-[250px]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {complaint.address}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" /> {date}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-border">
        {complaint.workerId ? (
          <div className="hidden lg:flex flex-col items-end text-right mr-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned To</span>
            <span className="text-sm font-semibold">{complaint.worker?.name || 'Worker'}</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <select
              className="h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => {
                if (e.target.value) {
                  onAssign(complaint.id, e.target.value);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Assign Worker...</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background border border-transparent hover:border-border transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
