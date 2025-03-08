import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { ClientTodoList } from '@/components/ClientTodoList';
import Chat from '@/components/Chat';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch todos server-side
  const initialTodos = await db.query.todos.findMany({
    where: eq(todos.userId, session.user.id),
    orderBy: (todos, { desc }) => [desc(todos.createdAt)],
  });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📝</span> Your Tasks
        </h2>
        <ClientTodoList initialTodos={initialTodos} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span> Chat with AI
        </h2>
        <Chat />
      </div>
    </div>
  );
} 