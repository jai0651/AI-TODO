'use client';

import { motion } from "framer-motion";
import { MessageSquare, CheckSquare, Plus } from "lucide-react";

export function AppPreview() {
  const mockTodos = [
    { id: 1, title: "Review project proposal", completed: true },
    { id: 2, title: "Schedule team meeting", completed: false },
    { id: 3, title: "Update documentation", completed: false },
  ];

  const mockChat = [
    { role: "user", content: "Add a task to review the new design" },
    { role: "assistant", content: "I've added 'Review new design mockups' to your todo list." },
  ];

  return (
    <div className="relative w-full h-full p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5" />

      {/* Content */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Todo List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 border border-border shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">My Tasks</h3>
            <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-primary" />
            </button>
          </div>
          <div className="space-y-4">
            {mockTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: todo.id * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className={`p-1 rounded ${todo.completed ? 'bg-primary/20' : 'bg-muted'}`}>
                  <CheckSquare className={`w-5 h-5 ${todo.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {todo.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
          </div>
          <div className="space-y-4 mb-4">
            {mockChat.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full p-3 pr-12 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 