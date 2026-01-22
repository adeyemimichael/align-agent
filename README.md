# Adaptive Productivity Agent

An AI-powered productivity system that plans your day based on your actual capacity (energy, sleep, stress, mood) rather than treating you like a constant-output machine.

## Features

- 🎯 **Capacity-Based Planning**: Daily check-ins assess your real capacity
- 🤖 **AI-Powered Reasoning**: Uses Google Gemini AI for intelligent task prioritization
- 📅 **Calendar Integration**: Syncs with Google Calendar for time blocking
- ✅ **Task Management**: Integrates with Todoist, Notion, and Linear
- 📊 **Pattern Learning**: Learns from your history to make better predictions
- 🎨 **Beautiful UI**: Clean, greenish design with smooth animations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js v5 with Google OAuth
- **AI**: Google Gemini AI
- **Testing**: Vitest, React Testing Library, fast-check

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+
- Google OAuth credentials (for authentication)
- Gemini AI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd adaptive-productivity-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `GEMINI_API_KEY`: From Google AI Studio

4. Set up the database:
```bash
npm run db:setup
```

Or manually:
```bash
createdb adaptive_productivity
npx prisma migrate dev --name init
```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:setup` - Set up database (first time)
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma Client

## Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility functions and shared code
│   └── prisma.ts          # Prisma client instance
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Database schema
├── public/                # Static assets
├── scripts/               # Setup and utility scripts
└── tests/                 # Test files
```

## Database Schema

The application uses the following main models:

- **User**: User accounts and authentication
- **CheckIn**: Daily capacity check-ins (energy, sleep, stress, mood)
- **DailyPlan**: Generated daily plans with AI reasoning
- **PlanTask**: Individual tasks in a plan
- **Goal**: User-defined goals
- **Integration**: Connected platforms (Google Calendar, Todoist, etc.)

## Development

### Running Tests

```bash
npm run test
```

The project uses property-based testing with fast-check to ensure correctness across many inputs.

### Database Management

View your database in a GUI:
```bash
npm run db:studio
```

Create a new migration after schema changes:
```bash
npm run db:migrate
```

## Contributing

This project was built for a hackathon. Contributions are welcome!

## License

MIT
