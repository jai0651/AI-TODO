'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: number;
}

interface TodoContextType {
  todos: Todo[];
  isLoading: boolean;
  addTodo: (text: string) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTodos = useCallback(async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]);
    }
  }, []);

  const addTodo = useCallback(async (text: string) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setTodos(prev => [...prev, data]);
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }, []);

  const deleteTodo = useCallback(async (id: number) => {
    try {
      await fetch('/api/todos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }, []);

  const toggleTodo = useCallback(async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: todo.completed ? 0 : 1 }),
      });
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, completed: t.completed ? 0 : 1 } : t
        )
      );
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }, [todos]);

  React.useEffect(() => {
    refreshTodos();
  }, [refreshTodos]);

  return (
    <TodoContext.Provider value={{ todos, isLoading, addTodo, deleteTodo, toggleTodo, refreshTodos }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
} 