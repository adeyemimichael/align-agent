# Align AI Agent

> An intelligent productivity system that adapts to your real capacity, not just your calendar.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-app-url.vercel.app)
[![Video Demo](https://img.shields.io/badge/video-watch-red)](https://your-demo-video-url)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Align AI Agent is an AI-powered productivity assistant that plans your day based on your actual capacity—energy levels, sleep quality, stress, and mood—rather than treating you like a constant-output machine. It learns from your patterns and helps you work with your natural rhythms, not against them.

## 🔗 Links

- **Live App**: [https://your-app-url.vercel.app](https://your-app-url.vercel.app)
- **Demo Video**: [Watch on YouTube](https://your-demo-video-url)
- **Documentation**: [Full Docs](./DEPLOYMENT.md)

## ✨ Features

- 🎯 **Capacity-Based Planning** - Daily check-ins assess your real capacity to work
- 🤖 **AI-Powered Scheduling** - Google Gemini AI intelligently prioritizes and schedules tasks
- 📅 **Calendar Integration** - Seamless sync with Google Calendar for time blocking
- ✅ **Task Management** - Integrates with Todoist, Notion, and Linear
- 📊 **Pattern Learning** - Learns from your history to make better predictions
- 🔔 **Smart Notifications** - Adaptive reminders based on your productivity windows
- 📈 **Progress Tracking** - Real-time sync with task apps and momentum tracking
- 🎨 **Beautiful UI** - Clean, accessible design with smooth animations

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/adeyemimichael">
        <img src="https://github.com/adeyemimichael.png" width="100px;" alt="Adeyemi Michael"/>
        <br />
        <sub><b>Adeyemi Michael</b></sub>
      </a>
      <br />
      <a href="https://twitter.com/your-twitter" title="Twitter">🐦</a>
      <a href="https://linkedin.com/in/your-linkedin" title="LinkedIn">💼</a>
    </td>
    <!-- Add more contributors here -->
  </tr>
</table>

## 📱 Connect With Us

- **Twitter**: [@your-twitter-handle](https://twitter.com/your-twitter-handle)
- **LinkedIn**: [Your Name](https://linkedin.com/in/your-linkedin)
- **GitHub**: [@adeyemimichael](https://github.com/adeyemimichael)
- **Email**: ayobami732000@gmail.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Database by [Prisma](https://www.prisma.io/)
- Deployed on [Vercel](https://vercel.com)

---

**Made with ❤️ for people who want to work with their energy, not against it.**
