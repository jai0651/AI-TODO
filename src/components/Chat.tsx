"use client";

import { useState, useEffect, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoStore } from './ClientTodoList';
import debounce from 'lodash/debounce';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface ChatResponse {
  message: string;
  changes: {
    added: string[];
    completed: string[];
    uncompleted: string[];
    deleted: string[];
  };
}

const WELCOME_MESSAGES: Message[] = [
  {
    id: 1,
    text: "👋 Hi! I'm your AI task assistant. I can help you manage your todos and answer questions.",
    isUser: false
  },
  {
    id: 2,
    text: "I can help you with:",
    isUser: false
  }
];

// Memoized ChatMessage component
const ChatMessage = memo(({ message }: { message: Message }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -50 }}
    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`max-w-[85%] rounded-xl px-4 py-2.5 text-base whitespace-pre-wrap shadow-sm ${
        message.isUser
          ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
      }`}
    >
      {message.text}
    </div>
  </motion.div>
));

ChatMessage.displayName = 'ChatMessage';

// Loading indicator component
const LoadingIndicator = memo(() => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-start"
  >
    <div className="bg-white dark:bg-gray-700 rounded-xl px-4 py-2.5 flex items-center space-x-1.5 border border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  </motion.div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Get todos and update functions from TodoStore
  const { todos, setTodos } = useTodoStore();

  // Debounced scroll to bottom
  const scrollToBottom = useCallback(
    debounce(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data: ChatResponse = await response.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: data.message, 
        isUser: false 
      }]);

      // If there are changes, fetch the updated todos
      if (data.changes.added.length > 0 || data.changes.completed.length > 0 || 
          data.changes.uncompleted.length > 0 || data.changes.deleted.length > 0) {
        const todosResponse = await fetch("/api/todos");
        if (todosResponse.ok) {
          const updatedTodos = await todosResponse.json();
          setTodos(updatedTodos);
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Sorry, I'm having trouble responding right now. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      scrollToBottom.cancel();
    };
  }, [scrollToBottom]);

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Assistant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Ask me anything about your tasks</p>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-4"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isLoading && <LoadingIndicator />}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your tasks..."
            disabled={isLoading}
            className="flex-1 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-base focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 dark:text-white transition-colors disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-base bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 shadow-sm"
          >
            Send
          </motion.button>
        </form>
      </div>
    </div>
  );
} 