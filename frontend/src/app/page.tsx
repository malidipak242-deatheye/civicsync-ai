"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Camera, Zap, CheckCircle2, Shield, LayoutDashboard } from "lucide-react";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] opacity-50 mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] opacity-40 mix-blend-screen" />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full z-50 top-0 backdrop-blur-2xl bg-background/60 border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              CivicSync <span className="text-primary font-medium">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-5 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live in Amalner
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto mb-10"
        >
          <motion.h1 
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] mb-6"
          >
            Report Civic Issues{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
              in 30 Seconds
            </span>
          </motion.h1>
          <motion.p 
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Snap a photo. Our Gemini AI automatically detects the issue, categorizes it, and notifies the right department. Zero forms, instant results.
          </motion.p>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-24"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-bold shadow-xl shadow-primary/20 gap-2 hover:scale-105 transition-transform duration-300"
            >
              Report an Issue <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-semibold border-border bg-card/50 backdrop-blur-md hover:bg-accent gap-2 hover:scale-105 transition-transform duration-300"
            >
              <LayoutDashboard className="w-5 h-5" /> Open Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* How it works */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Beautifully Simple</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Three steps to a cleaner, safer city. No complex forms required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: "01",
                icon: <Camera className="w-7 h-7 text-primary" />,
                title: "Snap a Photo",
                desc: "Open the app and take a picture of the pothole, garbage, or broken light.",
              },
              {
                step: "02",
                icon: <Zap className="w-7 h-7 text-amber-500" />,
                title: "AI Analysis",
                desc: "Gemini AI instantly scans the image to identify the severity and category.",
              },
              {
                step: "03",
                icon: <CheckCircle2 className="w-7 h-7 text-emerald-500" />,
                title: "Auto-Routing",
                desc: "Your report is immediately sent to the municipal council for resolution.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="absolute -top-3 left-8">
                  <span className="text-[10px] font-black text-muted-foreground bg-background px-3 py-1 rounded-full border border-border uppercase tracking-widest">
                    STEP {item.step}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full mb-32 bg-card border border-border rounded-3xl p-8 sm:p-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "⚡️", title: "Instant", desc: "No wait times" },
              { icon: "🧠", title: "Smart", desc: "Powered by Gemini" },
              { icon: "📍", title: "Accurate", desc: "GPS precision" },
              { icon: "🔒", title: "Secure", desc: "Enterprise grade" },
            ].map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <p className="text-lg font-bold mb-1">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-700 text-primary-foreground p-10 sm:p-16 text-center border border-primary-foreground/10 shadow-2xl shadow-primary/20"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight leading-tight">
              Ready to transform your city?
            </h2>
            <p className="text-primary-foreground/80 mb-10 text-lg sm:text-xl font-medium">
              Join thousands of citizens making Amalner better, one report at a time.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-10 h-14 font-bold shadow-xl gap-2 hover:scale-105 transition-transform duration-300 text-primary"
              >
                Start Reporting <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>© 2026 CivicSync AI. Amalner Municipal Council.</span>
          </div>
          <div className="flex gap-8">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Create Account</Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
