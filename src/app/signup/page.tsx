"use client";

import { AuthForm } from "@/components/AuthForm";
import { AppPreview } from "@/components/AppPreview";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignUpPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = currentTheme === 'dark';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-300 dark:to-blue-300">AI Todo</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" className="font-medium">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign Up Form Side */}
      <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm p-8 pt-24 lg:pt-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-300 dark:to-blue-300"
            >
              Create Account
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-muted-foreground"
            >
              Join us to start managing tasks with AI
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-lg dark:shadow-slate-900/50"
          >
            <AuthForm mode="signup" />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-muted/50 dark:bg-slate-900/50">
        <AppPreview />
      </div>
    </div>
  );
} 