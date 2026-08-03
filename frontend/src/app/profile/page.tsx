"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, User, Mail, Phone, Shield, Loader2,
  LogOut, CheckCircle2, AlertCircle, Edit2, Save, X, ChevronRight, Settings, Bell, HelpCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  CITIZEN: { label: "Citizen", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  WORKER: { label: "Field Worker", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  DEPARTMENT_MANAGER: { label: "Department Manager", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  SUPER_ADMIN: { label: "Super Admin", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [editData, setEditData] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setEditData({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user, authLoading, router]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError("");
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError("");
    if (user) setEditData({ name: user.name || "", phone: user.phone || "" });
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }
    setSaveError("");
    setIsSaving(true);
    try {
      updateUser({ name: editData.name.trim(), phone: editData.phone });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getHomeRoute = () => {
    if (!user) return "/";
    if (user.role === "SUPER_ADMIN" || user.role === "DEPARTMENT_MANAGER") return "/admin";
    if (user.role === "WORKER") return "/worker";
    return "/dashboard";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const roleConf = ROLE_LABELS[user.role] || ROLE_LABELS.CITIZEN;
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link href={getHomeRoute()}>
            <button className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-lg font-bold">Profile & Settings</h1>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto p-5 pb-12 space-y-8">
        
        {/* Avatar Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-4">
          <div className="relative mb-4 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-3xl font-black text-white shadow-xl relative z-10 border-4 border-background">
              {initials}
            </div>
          </div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground mb-3">{user.email}</p>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleConf.color} shadow-sm`}>
            <Shield className="w-3 h-3" />
            {roleConf.label}
          </span>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              Profile updated successfully
            </motion.div>
          )}
          {saveError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {saveError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personal Details Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between bg-accent/30">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Details
            </h3>
            {!isEditing ? (
              <button onClick={handleEdit} className="text-primary font-bold text-sm hover:underline">
                Edit
              </button>
            ) : (
              <button onClick={handleCancel} className="text-muted-foreground font-bold text-sm hover:underline">
                Cancel
              </button>
            )}
          </div>
          
          <div className="p-5 space-y-6">
            {/* Name */}
            <div>
              <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wide mb-2 block">Full Name</Label>
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="bg-background border-border h-12 rounded-xl px-4 shadow-sm"
                />
              ) : (
                <p className="font-semibold text-lg">{user.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wide mb-2 block">Email Address</Label>
              <p className="font-semibold text-lg">{user.email}</p>
            </div>

            {/* Phone */}
            <div>
              <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wide mb-2 block">Phone Number</Label>
              {isEditing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="bg-background border-border h-12 rounded-xl px-4 shadow-sm"
                />
              ) : (
                <p className="font-semibold text-lg">{user.phone || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
              )}
            </div>

            {/* Save Action */}
            <AnimatePresence>
              {isEditing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 gap-2 mt-2"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-5 h-5" /> Save Changes</>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Preferences / Settings List (iOS style) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden divide-y divide-border">
          <button className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-bold">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Settings className="w-5 h-5" />
              </div>
              <span className="font-bold">App Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-bold">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-14 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full gap-2 font-bold shadow-sm"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </Button>
        </motion.div>

        {/* Version */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-xs text-muted-foreground/60 pt-4 font-medium">
          CivicSync AI v1.0 <br />Amalner Municipal Council
        </motion.p>
      </main>
    </div>
  );
}
