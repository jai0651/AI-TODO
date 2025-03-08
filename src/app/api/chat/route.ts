import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq, ilike, and } from 'drizzle-orm';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { headers } from 'next/headers';

// Define Todo type
interface Todo {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to extract commands from the AI response
const extractCommands = (content: string, prefix: string): string[] => {
  const regex = new RegExp(`${prefix}:\\s*([^\\n]+)`, 'gi');
  const matches = [...content.matchAll(regex)];
  return matches.map(match => match[1].trim());
};

export async function POST(req: Request) {
  try {
    // Get session from JWT directly without database hit
    const token = await getToken({ 
      req: req as any, // Type assertion needed for NextAuth
      secret: process.env.NEXTAUTH_SECRET 
    });
    const userId = token?.sub; // sub is the user ID in JWT
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' }, 
        { status: 400 }
      );
    }

    // Get current todos from database
    let currentTodos: Todo[];
    try {
      currentTodos = await db.query.todos.findMany({
        where: eq(todos.userId, userId),
        orderBy: (todos, { desc }) => [desc(todos.createdAt)],
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch todos' },
        { status: 500 }
      );
    }
    
    const todoContext = currentTodos.length > 0 
      ? currentTodos.map((todo: Todo) => `- ${todo.title} (${todo.completed ? 'completed' : 'pending'})`).join('\n')
      : 'No current todos.';

    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: `You are a helpful AI assistant managing a todo list. Here are the current todos:
${todoContext}

Your capabilities:
1. Add new todos when users ask (use format: ADD TODO: <task>)
2. Mark todos as complete/incomplete (use: MARK COMPLETE: <task> or MARK INCOMPLETE: <task>)
3. Delete todos (use: DELETE TODO: <task>)
4. List and summarize todos
5. Answer questions about tasks
6. Provide task management suggestions

Instructions:
- Always confirm your actions in natural language
- If adding/updating/deleting todos, use the exact format specified above
- Put each command on a new line
- If you're adding multiple todos, use a separate ADD TODO: command for each one
- For bulk actions (like "mark all as complete"), you MUST list EACH todo individually with its own command
- When user says "mark all as done", you MUST output a MARK COMPLETE command for EACH existing todo
- When user says "delete all", you MUST output a DELETE TODO command for EACH existing todo
- If you can't find an exact todo match, suggest the closest match
- Be friendly and helpful
- Keep responses concise but informative
- Use emojis occasionally to be more engaging`
    };

    const userMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: message
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message?.content || '';

    // Track changes to send back to the client
    let changes = {
      added: [] as string[],
      completed: [] as string[],
      uncompleted: [] as string[],
      deleted: [] as string[]
    };

    try {
      // Extract and process commands
      const addCommands = extractCommands(content, 'ADD TODO');
      const completeCommands = extractCommands(content, 'MARK COMPLETE');
      const uncompleteCommands = extractCommands(content, 'MARK INCOMPLETE');
      const deleteCommands = extractCommands(content, 'DELETE TODO');

      // Process add commands
      if (addCommands.length > 0) {
        const newTodos = await db.insert(todos)
          .values(addCommands.map(title => ({
            userId: userId as string,
            title,
            completed: false,
          })))
          .returning();
        changes.added = newTodos.map(todo => todo.title);
      }

      // Process complete commands
      for (const title of completeCommands) {
        const [updatedTodo] = await db
          .update(todos)
          .set({ completed: true, updatedAt: new Date() })
          .where(and(
            eq(todos.userId, userId as string),
            eq(todos.title, title)
          ))
          .returning();
        if (updatedTodo) {
          changes.completed.push(updatedTodo.title);
        }
      }

      // Process uncomplete commands
      for (const title of uncompleteCommands) {
        const [updatedTodo] = await db
          .update(todos)
          .set({ completed: false, updatedAt: new Date() })
          .where(and(
            eq(todos.userId, userId as string),
            eq(todos.title, title)
          ))
          .returning();
        if (updatedTodo) {
          changes.uncompleted.push(updatedTodo.title);
        }
      }

      // Process delete commands
      for (const title of deleteCommands) {
        const [deletedTodo] = await db
          .delete(todos)
          .where(and(
            eq(todos.userId, userId as string),
            eq(todos.title, title)
          ))
          .returning();
        if (deletedTodo) {
          changes.deleted.push(deletedTodo.title);
        }
      }

      // If any commands failed to match exactly, try fuzzy matching
      const failedCompleteCommands = completeCommands.filter(cmd => !changes.completed.includes(cmd));
      const failedUncompleteCommands = uncompleteCommands.filter(cmd => !changes.uncompleted.includes(cmd));
      const failedDeleteCommands = deleteCommands.filter(cmd => !changes.deleted.includes(cmd));

      // Try fuzzy matching for failed complete commands
      for (const title of failedCompleteCommands) {
        const [updatedTodo] = await db
          .update(todos)
          .set({ completed: true, updatedAt: new Date() })
          .where(and(
            eq(todos.userId, userId as string),
            ilike(todos.title, `%${title}%`)
          ))
          .returning();
        if (updatedTodo) {
          changes.completed.push(updatedTodo.title);
        }
      }

      // Try fuzzy matching for failed uncomplete commands
      for (const title of failedUncompleteCommands) {
        const [updatedTodo] = await db
          .update(todos)
          .set({ completed: false, updatedAt: new Date() })
          .where(and(
            eq(todos.userId, userId as string),
            ilike(todos.title, `%${title}%`)
          ))
          .returning();
        if (updatedTodo) {
          changes.uncompleted.push(updatedTodo.title);
        }
      }

      // Try fuzzy matching for failed delete commands
      for (const title of failedDeleteCommands) {
        const [deletedTodo] = await db
          .delete(todos)
          .where(and(
            eq(todos.userId, userId as string),
            ilike(todos.title, `%${title}%`)
          ))
          .returning();
        if (deletedTodo) {
          changes.deleted.push(deletedTodo.title);
        }
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

    // Get the final state of todos after all changes
    const finalTodos = await db.query.todos.findMany({
      where: eq(todos.userId, userId),
      orderBy: (todos, { desc }) => [desc(todos.createdAt)],
    });

    return NextResponse.json({
      message: content,
      changes
    }, {
      status: 200
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
