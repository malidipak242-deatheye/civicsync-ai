"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, Clock, MapPin, Camera, Navigation,
  Loader2, LogOut, RefreshCw, AlertCircle, HardHat, UploadCloud, ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), { ssr: false });

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

const DEMO_TASKS = [
  {
    id: "COMP-001",
    title: "Large Pothole on Market Road",
    category: "Pothole",
    priority: "HIGH",
    status: "ASSIGNED",
    address: "Market Road, Near Municipal Office, Amalner",
    latitude: 21.0425,
    longitude: 75.0592,
    createdAt: "2026-07-30T00:00:00Z",
  },
  {
    id: "COMP-007",
    title: "Overflowing drainage near school",
    category: "Drainage",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    address: "Zila Parishad School, Ward 3, Amalner",
    latitude: 21.045,
    longitude: 75.062,
    createdAt: "2026-07-31T00:00:00Z",
  },
];

export default function WorkerDashboard() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [workNotes, setWorkNotes] = useState("");
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "WORKER") {
        router.push(user.role === "CITIZEN" ? "/dashboard" : "/admin");
      }
    }
  }, [user, authLoading, router]);

  const fetchTasks = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setIsDemo(false);
    try {
      const res = await api.get("/complaints");
      const data = res.data?.complaints || res.data || [];
      setTasks(data.filter((c: any) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS"));
    } catch {
      setIsDemo(true);
      setTasks(DEMO_TASKS);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (user && user.role === "WORKER") fetchTasks();
  }, [user]);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    setUpdating(taskId);
    try {
      await api.patch(`/complaints/${taskId}/status`, {
        status: newStatus,
        notes: workNotes || `Status changed to ${newStatus}`,
      });
      setUpdateSuccess(taskId);
      setOpenDialogId(null);
      setWorkNotes("");
      await fetchTasks();
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setOpenDialogId(null);
      setWorkNotes("");
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-muted-foreground text-sm font-medium">Syncing assignments...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "WORKER") return null;

  const assignedCount = tasks.filter((t) => t.status === "ASSIGNED").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20">
      
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Field Portal</p>
              <p className="text-xs text-muted-foreground font-medium hidden sm:block">Amalner Council</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2 inline-block"></span>
              On Duty
            </Badge>
            <button
              onClick={fetchTasks}
              disabled={isRefreshing}
              className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors ml-2"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 py-6">
        
        <AnimatePresence>
          {isDemo && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm mb-6 font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              Backend offline — showing offline cache.
            </motion.div>
          )}

          {updateSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm mb-6 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Status updated successfully
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-gradient-to-br from-emerald-600/10 via-emerald-600/5 to-transparent border border-emerald-500/20 p-6 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-xs mb-1">Welcome back</p>
            <h1 className="text-3xl font-black mb-6">{user.name?.split(" ")[0]}</h1>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background/50 backdrop-blur rounded-2xl p-3 border border-border shadow-sm text-center">
                <p className="text-2xl font-black text-blue-500">{assignedCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-1 tracking-wide">Assigned</p>
              </div>
              <div className="bg-background/50 backdrop-blur rounded-2xl p-3 border border-border shadow-sm text-center">
                <p className="text-2xl font-black text-amber-500">{inProgressCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-1 tracking-wide">Progress</p>
              </div>
              <div className="bg-background/50 backdrop-blur rounded-2xl p-3 border border-border shadow-sm text-center">
                <p className="text-2xl font-black text-foreground">{tasks.length}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-1 tracking-wide">Total</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex bg-accent/50 p-1 rounded-2xl border border-border w-fit mb-6">
          <button
            onClick={() => setActiveTab("list")}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "list" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === "list" && <motion.div layoutId="workerTab" className="absolute inset-0 bg-background rounded-xl border border-border shadow-sm" />}
            <span className="relative z-10 flex items-center gap-2">List View</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "map" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === "map" && <motion.div layoutId="workerTab" className="absolute inset-0 bg-background rounded-xl border border-border shadow-sm" />}
            <span className="relative z-10 flex items-center gap-2">Map View</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "list" && (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {tasks.length === 0 ? (
                <div className="w-full min-h-[300px] rounded-3xl border-2 border-dashed border-border bg-accent/30 flex flex-col items-center justify-center p-8 text-center mt-4">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <p className="text-xl font-black text-foreground mb-2">All caught up!</p>
                  <p className="text-sm text-muted-foreground max-w-xs">You have no active assignments right now. Take a break.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <motion.div
                      layout
                      key={task.id}
                      className="bg-card border border-border rounded-[2rem] p-5 hover:border-primary/30 transition-all shadow-sm group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-wider ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.LOW}`}>
                              {task.priority}
                            </Badge>
                            <span className="text-xs font-bold font-mono text-muted-foreground bg-accent px-2 py-1 rounded-md">
                              {task.id?.slice ? `#${task.id.slice(-6).toUpperCase()}` : `#${task.id}`}
                            </span>
                            <Badge className={`font-black text-[10px] uppercase tracking-wider ${
                              task.status === "IN_PROGRESS"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                            }`}>
                              {STATUS_LABELS[task.status] || task.status}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold mb-3 line-clamp-2">{task.title}</h3>
                          
                          <div className="flex flex-col gap-2 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-2 bg-background p-2 rounded-xl border border-border">
                              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="line-clamp-1">{task.address}</span>
                            </span>
                            <span className="flex items-center gap-2 px-2 py-1">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              {new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute:"2-digit" })}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-border sm:pl-4 justify-end">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude || task.lat},${task.longitude || task.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-accent/50 hover:bg-accent text-foreground text-sm font-bold transition-all"
                          >
                            <Navigation className="w-4 h-4" /> Nav
                          </a>

                          <Dialog open={openDialogId === task.id} onOpenChange={(open) => { setOpenDialogId(open ? task.id : null); setWorkNotes(""); }}>
                            <DialogTrigger className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-all shadow-md shadow-primary/20">
                              <CheckCircle2 className="w-4 h-4" /> Action
                            </DialogTrigger>
                            
                            <DialogContent className="bg-card border-border p-6 rounded-[2rem] max-w-sm w-[90vw]">
                              <DialogHeader className="mb-4">
                                <DialogTitle className="text-xl font-black">Update Task</DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    disabled={updating === task.id}
                                    onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-background hover:border-amber-500/50 hover:bg-amber-500/5 transition-all disabled:opacity-50 group"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Clock className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="text-sm font-bold text-foreground">In Progress</span>
                                  </button>
                                  <button
                                    disabled={updating === task.id}
                                    onClick={() => handleUpdateStatus(task.id, "RESOLVED")}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-background hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all disabled:opacity-50 group"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <span className="text-sm font-bold text-foreground">Resolved</span>
                                  </button>
                                </div>

                                {/* Photo Upload */}
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 block">Proof of Work (Optional)</Label>
                                  <div className="relative w-full h-32 rounded-2xl border-2 border-dashed border-border bg-accent/30 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all overflow-hidden group">
                                    <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                      <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold group-hover:text-primary transition-colors">Tap to Upload Photo</span>
                                  </div>
                                </div>

                                {/* Notes */}
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 block">Work Notes</Label>
                                  <Textarea
                                    className="bg-background border-border rounded-xl resize-none shadow-sm focus-visible:ring-primary p-4"
                                    placeholder="Describe the action taken..."
                                    rows={3}
                                    value={workNotes}
                                    onChange={(e) => setWorkNotes(e.target.value)}
                                  />
                                </div>

                                {updating === task.id && (
                                  <div className="flex items-center justify-center gap-2 text-primary font-bold bg-primary/10 p-3 rounded-xl border border-primary/20">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Updating system...
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "map" && (
            <motion.div key="map" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border bg-accent/30">
                  <h2 className="font-bold text-lg">Assigned Locations</h2>
                  <p className="text-sm text-muted-foreground">Geographic view of your pending tasks</p>
                </div>
                <div className="p-5 h-[50vh] min-h-[400px]">
                  <LocationPicker
                    onLocationSelect={() => {}}
                    defaultPosition={tasks[0] ? [tasks[0].latitude || tasks[0].lat || 21.0425, tasks[0].longitude || tasks[0].lng || 75.0592] : [21.0425, 75.0592]}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
