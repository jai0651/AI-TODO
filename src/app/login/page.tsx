"use client";

import { AuthForm } from "@/components/AuthForm";
import { AppPreview } from "@/components/AppPreview";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LoginPage() {
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
    <div className="min-h-screen w-full flex">
      {/* Login Form Side */}
      <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400"
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-gray-600 dark:text-gray-400"
            >
              Sign in to continue to your AI-powered todo list
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <AuthForm mode="login" />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              Sign up
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <AppPreview />
      </div>
    </div>
  );
} 