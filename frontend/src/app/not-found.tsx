"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 justify-center mb-8 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tight">CivicSync <span className="text-primary">AI</span></span>
        </Link>

        {/* 404 */}
        <div className="relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <p className="text-[12rem] font-black text-primary/5 select-none tracking-tighter">404</p>
          </motion.div>
          <div className="relative z-10 py-10">
            <h1 className="text-4xl font-black text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground text-lg font-medium">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 transition-transform hover:scale-105">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:w-auto border-border bg-background hover:bg-accent text-foreground gap-2 rounded-full px-8 h-12 font-bold transition-all"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
