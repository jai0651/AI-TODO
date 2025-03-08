import { useState, useEffect } from 'react';
import { useTodo } from '@/context/TodoContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE = {
  role: 'assistant' as const,
  content: "👋 Hi! I'm your AI todo assistant. I can help you manage your tasks. You can:\n\n" +
    "• Add new todos\n" +
    "• Mark todos as complete/incomplete\n" +
    "• Delete todos\n" +
    "• Ask about your tasks\n\n" +
    "How can I help you today?"
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTodos } = useTodo();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    const newMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response.content,
        }]);
        
        // If the AI's response includes any todo actions, refresh the todo list
        const content = data.response.content.toLowerCase();
        if (content.includes('add todo:') || 
            content.includes('mark complete:') || 
            content.includes('mark incomplete:') || 
            content.includes('delete todo:')) {
          // Wait a bit for the database to update
          setTimeout(refreshTodos, 500);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={sendMessage} className="border-t dark:border-gray-700 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your todos..."
            className="flex-1 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 