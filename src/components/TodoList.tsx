'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodo } from '@/context/TodoContext';

interface Todo {
  id: number;
  text: string;
  completed: number;
}

export function TodoList() {
  const { todos, isLoading, addTodo, deleteTodo, toggleTodo } = useTodo();
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodo(newTodo.trim());
    setNewTodo('');
  };

  if (isLoading && todos.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200"
        >
          Add
        </motion.button>
      </form>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {todos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-8 text-gray-500 dark:text-gray-400"
            >
              <p className="text-6xl mb-4">📝</p>
              <p className="text-lg">No tasks yet. Add your first task!</p>
            </motion.div>
          ) : (
            todos.map((todo: Todo, index: number) => (
              <motion.div
                layout
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                  layout: { duration: 0.2 }
                }}
                className="group bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <motion.button
                    layout="position"
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${todo.completed 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-gray-300 dark:border-gray-500'}`}
                    >
                      {todo.completed ? (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </motion.svg>
                      ) : null}
                    </div>
                    <span className={`text-gray-800 dark:text-gray-200 ${
                      todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                    }`}>
                      {todo.text}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center gap-2"
                  >
                    <span>Delete</span>
                    <span className="text-sm">🗑️</span>
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
} 