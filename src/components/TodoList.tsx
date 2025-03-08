"use client";

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Todo } from "@/db/schema";
import { create } from 'zustand';
import { useVirtualizer } from '@tanstack/react-virtual';

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (todo: Todo) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  isLoading: true,
  error: null,
  fetchTodos: async () => {
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      set({ todos: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load todos", isLoading: false });
    }
  },
  addTodo: async (title: string) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error("Failed to add todo");

      const addedTodo = await response.json();
      set(state => ({ todos: [addedTodo, ...state.todos], error: null }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to add todo" });
    }
  },
  toggleTodo: async (todo: Todo) => {
    const optimisticTodos = get().todos.map(t => 
      t.id === todo.id ? { ...t, completed: !t.completed } : t
    );
    set({ todos: optimisticTodos });

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) throw new Error("Failed to update todo");
      const updatedTodo = await response.json();
      set(state => ({
        todos: state.todos.map(t => t.id === updatedTodo.id ? updatedTodo : t),
        error: null
      }));
    } catch (err) {
      set(state => ({ 
        todos: state.todos.map(t => t.id === todo.id ? todo : t),
        error: err instanceof Error ? err.message : "Failed to update todo" 
      }));
    }
  },
  deleteTodo: async (id: string) => {
    const previousTodos = get().todos;
    set(state => ({ todos: state.todos.filter(todo => todo.id !== id) }));

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");
    } catch (err) {
      set({ 
        todos: previousTodos,
        error: err instanceof Error ? err.message : "Failed to delete todo" 
      });
    }
  },
}));

// Memoized TodoItem component
const TodoItem = memo(({ todo, onToggle, onDelete }: { 
  todo: Todo; 
  onToggle: (todo: Todo) => void; 
  onDelete: (id: string) => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
  >
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo)}
      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
    />
    <span className={`flex-1 text-gray-800 dark:text-gray-200 ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
      {todo.title}
    </span>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onDelete(todo.id)}
      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
    >
      ✕
    </motion.button>
  </motion.div>
));

TodoItem.displayName = 'TodoItem';

export function TodoList() {
  const todos = useTodoStore(state => state.todos);
  const isLoading = useTodoStore(state => state.isLoading);
  const error = useTodoStore(state => state.error);
  const { fetchTodos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodo(newTodo);
    setNewTodo("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 dark:text-white transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Add
        </motion.button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      </AnimatePresence>

      {todos.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No tasks yet. Add one above!
        </p>
      )}
    </div>
  );
} 