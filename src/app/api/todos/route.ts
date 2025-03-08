import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/todos - Get all todos for the current user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userTodos = await db.query.todos.findMany({
    where: eq(todos.userId, session.user.id),
    orderBy: (todos, { desc }) => [desc(todos.createdAt)],
  });

  return NextResponse.json(userTodos);
}

// POST /api/todos - Create a new todo
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { title } = await req.json();

  if (!title) {
    return new NextResponse("Title is required", { status: 400 });
  }

  const newTodo = await db.insert(todos).values({
    userId: session.user.id,
    title,
  }).returning();

  return NextResponse.json(newTodo[0]);
}

export async function PUT(request: Request) {
  try {
    const { id, completed } = await request.json();
    const [updatedTodo] = await db
      .update(todos)
      .set({ completed })
      .where(eq(todos.id, id))
      .returning();
    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.delete(todos).where(eq(todos.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
} 