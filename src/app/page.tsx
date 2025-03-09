"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageSquare, CheckSquare, Sparkles, Brain, Zap, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Task Management",
    description: "Let our AI assistant help you organize and manage your tasks naturally through conversation."
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Natural Language Interface",
    description: "Simply chat with the AI to add, update, or complete tasks - no complex forms needed."
  },
  {
    icon: <CheckSquare className="w-6 h-6" />,
    title: "Smart Organization",
    description: "Tasks are automatically organized and prioritized based on your work patterns."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-time Updates",
    description: "See your todo list update in real-time as you chat with the AI assistant."
  }
];

export default function HomePage() {
  const { data: session, status } = useSession();

  // Only redirect to dashboard if user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      redirect("/dashboard");
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-background">
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
              {status === "authenticated" ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="font-medium">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button 
                    size="lg"
                    className="font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-300 dark:to-blue-300 mb-6">
              Task Management,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 dark:from-blue-300 dark:to-teal-300">
                Reimagined with AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Experience the future of task management with our AI-powered todo list. Simply chat with our AI assistant to organize your tasks effortlessly.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  See Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl bg-card backdrop-blur-xl border border-border shadow-lg dark:shadow-slate-900/50"
              >
                <div className="absolute -top-4 -left-4 p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  {feature.icon}
                </div>
                <div className="pt-2 pl-12">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg dark:shadow-slate-900/50 border border-border">
            <div className="aspect-video relative bg-muted/50 backdrop-blur-sm">
              {/* Add a demo video or interactive demo here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg text-muted-foreground">
                  Interactive Demo Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              © 2024 AI Todo. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 