import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH /api/todos/[id] - Update a todo
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { completed } = await req.json();

  const [updatedTodo] = await db
    .update(todos)
    .set({ completed, updatedAt: new Date() })
    .where(
      and(
        eq(todos.id, params.id),
        eq(todos.userId, session.user.id)
      )
    )
    .returning();

  if (!updatedTodo) {
    return new NextResponse("Todo not found", { status: 404 });
  }

  return NextResponse.json(updatedTodo);
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [deletedTodo] = await db
    .delete(todos)
    .where(
      and(
        eq(todos.id, params.id),
        eq(todos.userId, session.user.id)
      )
    )
    .returning();

  if (!deletedTodo) {
    return new NextResponse("Todo not found", { status: 404 });
  }

  return NextResponse.json(deletedTodo);
} 