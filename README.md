# AI-Powered Todo App

A modern todo application with AI chat capabilities, built with Next.js, PostgreSQL, and OpenAI.

## Features

- ✨ AI-powered todo management
- 🎯 Create, complete, and delete todos through natural language
- 🌓 Dark/Light mode support
- 🔄 Real-time updates
- 🎨 Modern UI with animations

## Tech Stack

- Next.js 14
- PostgreSQL with Drizzle ORM
- OpenAI API
- TailwindCSS
- Framer Motion

## Deployment Requirements

1. PostgreSQL Database (You can use providers like Neon, Supabase, or any PostgreSQL host)
2. OpenAI API Key
3. Vercel Account

## Deployment Steps

1. Fork or clone this repository
2. Create a new project on Vercel
3. Connect your GitHub repository to Vercel
4. Add the following environment variables in Vercel:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
5. Deploy!

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run database migrations:
   ```bash
   npm run db:push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Migrations

The application uses Drizzle ORM for database management. After deploying, you'll need to run migrations:

1. Make sure your database is properly configured in Vercel
2. Run the following command locally:
   ```bash
   npm run db:push
   ```

## License

MIT 