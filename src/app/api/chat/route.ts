import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq, ilike } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Get current todos for context
    const currentTodos = await db.select().from(todos).orderBy(todos.createdAt);
    
    const todoContext = currentTodos.map(todo => 
      `- ${todo.text} (${todo.completed ? 'completed' : 'pending'})`
    ).join('\n');

    const systemPrompt = {
      role: 'system',
      content: `You are a helpful AI assistant managing a todo list. Here are the current todos:\n${todoContext}\n\n
Instructions:
1. To add a new todo, include "ADD TODO: <task>" in your response
2. To mark a todo as complete, include "MARK COMPLETE: <task>" in your response
3. To mark a todo as incomplete, include "MARK INCOMPLETE: <task>" in your response
4. To delete a todo, include "DELETE TODO: <task>" in your response

Always confirm your actions in natural language after performing them. Be helpful and friendly in your responses.
If you can't find an exact todo match, try to find the closest match or ask for clarification.`
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message;
    const content = response.content?.toLowerCase() || '';

    try {
      // Handle todo actions
      if (content.includes('add todo:')) {
        const todoText = response.content?.split('ADD TODO:')[1].split('\n')[0].trim();
        if (todoText) {
          await db.insert(todos).values({
            text: todoText,
            completed: 0,
          });
        }
      }

      if (content.includes('mark complete:')) {
        const todoText = response.content?.split('MARK COMPLETE:')[1].split('\n')[0].trim();
        if (todoText) {
          await db
            .update(todos)
            .set({ completed: 1, updatedAt: new Date() })
            .where(ilike(todos.text, `%${todoText}%`));
        }
      }

      if (content.includes('mark incomplete:')) {
        const todoText = response.content?.split('MARK INCOMPLETE:')[1].split('\n')[0].trim();
        if (todoText) {
          await db
            .update(todos)
            .set({ completed: 0, updatedAt: new Date() })
            .where(ilike(todos.text, `%${todoText}%`));
        }
      }

      if (content.includes('delete todo:')) {
        const todoText = response.content?.split('DELETE TODO:')[1].split('\n')[0].trim();
        if (todoText) {
          await db
            .delete(todos)
            .where(ilike(todos.text, `%${todoText}%`));
        }
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      // Continue with the response even if database operation fails
    }

    return NextResponse.json({ response: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 