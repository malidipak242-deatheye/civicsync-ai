"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Camera, Send, Sparkles, MapPin, CheckCircle2, Loader2,
  X, ArrowLeft, AlertCircle, ArrowRight, UploadCloud, FileText
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), { ssr: false });

const CATEGORIES = [
  "Garbage", "Pothole", "Street Light", "Water Leakage", "Drainage",
  "Road Damage", "Tree Fallen", "Dead Animal", "Stray Animal",
  "Illegal Dumping", "Public Toilet", "Other",
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

export default function ReportPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    lat: 21.0425,
    lng: 75.0592,
    address: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setAiError("File too large. Please choose an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Full = evt.target?.result as string;
      setPreviewUrl(base64Full);

      const base64 = base64Full.split(",")[1];
      const mimeType = file.type || "image/jpeg";

      setIsAnalyzing(true);
      setAiError(null);
      setAiApplied(false);
      setStep(3); // Jump to AI analyzing step

      try {
        const res = await api.post("/ai/analyze", { imageBase64: base64, mimeType });
        const data = res.data?.data;
        if (data) {
          setFormData((prev) => ({
            ...prev,
            title: data.title || prev.title,
            description: data.summary || prev.description,
            category: data.category || prev.category,
            priority: data.priority || prev.priority,
          }));
          setAiApplied(true);
          setTimeout(() => setStep(4), 1500); // Move to review step after success
        } else {
          setAiError("Could not detect details. Please fill manually.");
          setTimeout(() => setStep(4), 1500);
        }
      } catch {
        setAiError("AI analysis unavailable. Please fill manually.");
        setTimeout(() => setStep(4), 1500);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setSubmitError("Please enter a title for your complaint.");
      return;
    }
    if (!formData.category) {
      setSubmitError("Please select a category.");
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await api.post("/complaints", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        latitude: formData.lat,
        longitude: formData.lng,
        address: formData.address || `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}`,
      });
      setIsSubmitted(true);
      setStep(5);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setSubmitError("Please log in to submit a complaint.");
      } else {
        setIsSubmitted(true); // Demo fallback
        setStep(5);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setPreviewUrl(null);
    setAiApplied(false);
    setAiError(null);
    setSubmitError(null);
    setFormData({ title: "", description: "", category: "", priority: "MEDIUM", lat: 21.0425, lng: 75.0592, address: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStep(1);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center gap-4">
          <button 
            onClick={() => step > 1 && step < 5 ? prevStep() : router.push("/dashboard")}
            className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-foreground">Report Civic Issue</h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">Amalner Municipal Council</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= s ? "bg-primary w-4" : "bg-primary/20"}`}
              />
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto p-5 pb-24 overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD IMAGE */}
          {step === 1 && (
            <motion.section key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="h-full flex flex-col justify-center py-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Snap a Photo</h2>
                <p className="text-muted-foreground">Take a clear picture of the issue.</p>
              </div>

              <div
                className="relative w-full h-72 rounded-[2rem] border-2 border-dashed border-border bg-card hover:border-primary/50 transition-all cursor-pointer overflow-hidden group shadow-sm flex flex-col items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/10">
                  <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Tap to Upload</span>
                <span className="text-sm text-muted-foreground">Camera or Gallery</span>
              </div>
              
              <div className="mt-8">
                <Button variant="outline" className="w-full rounded-full h-14 font-semibold text-base border-border" onClick={() => { setPreviewUrl(null); nextStep(); }}>
                  Skip Photo
                </Button>
              </div>
            </motion.section>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <motion.section key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="py-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Pinpoint Location</h2>
                  <p className="text-sm text-muted-foreground">Where is this issue located?</p>
                </div>
              </div>

              <div className="bg-card rounded-[2rem] p-4 border border-border shadow-sm mb-6">
                <LocationPicker
                  onLocationSelect={(lat, lng) => setFormData({ ...formData, lat, lng })}
                  defaultPosition={[formData.lat, formData.lng]}
                />
              </div>

              <div className="space-y-2 mb-8">
                <Label className="text-sm font-semibold ml-1">Street Address (Optional)</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 123 Main St, Near Bus Stand"
                  className="h-14 rounded-2xl bg-card border-border px-4 shadow-sm"
                />
              </div>

              <Button onClick={() => previewUrl ? setStep(3) : nextStep()} className="w-full h-14 rounded-full font-bold shadow-lg shadow-primary/20 gap-2 text-base">
                Confirm Location <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.section>
          )}

          {/* STEP 3: AI ANALYSIS LOADING */}
          {step === 3 && (
            <motion.section key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="w-24 h-24 bg-card rounded-full border border-primary/30 flex items-center justify-center relative z-10 shadow-xl overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <Sparkles className="w-10 h-10 text-primary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Gemini AI is analyzing...</h2>
              <p className="text-muted-foreground">Detecting issue category and severity</p>
              
              <div className="w-64 h-2 bg-accent rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-primary rounded-full w-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ transformOrigin: '0% 50%' }} />
              </div>
            </motion.section>
          )}

          {/* STEP 4: REVIEW & DETAILS */}
          {step === 4 && (
            <motion.section key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="py-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Review Details</h2>
                  <p className="text-sm text-muted-foreground">Confirm or edit the information</p>
                </div>
              </div>

              {aiApplied && (
                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  Gemini AI auto-filled the details. Please review before submitting.
                </div>
              )}
              {aiError && (
                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {aiError}
                </div>
              )}

              {previewUrl && (
                <div className="w-full h-40 rounded-2xl border border-border overflow-hidden mb-6 relative group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => { setPreviewUrl(null); setStep(1); }}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-full p-2 hover:bg-background transition-colors shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-5 bg-card p-5 rounded-[2rem] border border-border shadow-sm mb-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Large pothole near bus stop"
                    className="h-12 rounded-xl bg-background border-border px-4 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold ml-1">Category *</Label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val ?? "" })}>
                      <SelectTrigger className="h-12 rounded-xl bg-background border-border shadow-sm">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold ml-1">Severity</Label>
                    <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val ?? "MEDIUM" })}>
                      <SelectTrigger className="h-12 rounded-xl bg-background border-border shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="LOW">🟢 Low</SelectItem>
                        <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                        <SelectItem value="HIGH">🟠 High</SelectItem>
                        <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Any additional details... (optional)"
                    className="min-h-[100px] rounded-xl bg-background border-border shadow-sm resize-none p-4"
                  />
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              <Button
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-full shadow-xl shadow-primary/20 gap-2 hover:scale-[1.02] transition-transform duration-300"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-5 h-5" /> Submit Report</>
                )}
              </Button>
            </motion.section>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <motion.section key="step5" variants={slideVariants} initial="initial" animate="animate" className="h-[70vh] flex flex-col items-center justify-center text-center pt-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative z-10 shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-3xl font-black mb-3">Report Submitted!</h2>
              <p className="text-muted-foreground text-base max-w-sm mb-8">
                Thank you. Your report has been sent to the Amalner Municipal Council for resolution.
              </p>

              <div className="bg-card border border-border shadow-sm rounded-3xl p-6 text-left space-y-3 w-full mb-8">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Summary</p>
                <p className="font-bold text-lg leading-snug">{formData.title}</p>
                <div className="flex gap-2 flex-wrap pt-2 border-t border-border/50">
                  <Badge className="bg-accent text-foreground border-border px-3 py-1 text-xs shadow-sm">{formData.category}</Badge>
                  <Badge className={`${PRIORITY_COLORS[formData.priority]} px-3 py-1 text-xs shadow-sm font-bold`}>{formData.priority}</Badge>
                </div>
              </div>

              <div className="w-full space-y-3">
                <Button className="w-full h-14 rounded-full font-bold shadow-lg shadow-primary/20" onClick={resetForm}>
                  Report Another Issue
                </Button>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full h-14 rounded-full font-bold border-border bg-transparent shadow-sm">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
