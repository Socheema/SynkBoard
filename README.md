# 🚀 SynkBoard - AI-Powered Real-Time Collaboration Platform

SynkBoard is a modern, collaborative dashboard that combines real-time synchronization with AI assistance. Built with Next.js 15, Supabase, and Groq AI.

![SynkBoard Demo](https://via.placeholder.com/1200x600?text=SynkBoard+Demo)

## ✨ Features

### Core Functionality
- 🔐 **Authentication** - Secure auth with Clerk (Email + Google OAuth)
- 👥 **Workspaces** - Create unlimited workspaces, invite team members
- 📋 **4 Widget Types** - Notes, Tasks, Charts, Chat
- 🎨 **Drag & Drop** - Intuitive grid layout with resize support
- ⚡ **Real-Time Sync** - See changes instantly across all users
- 🌓 **Dark Mode** - Seamless theme switching

### AI-Powered Features
- 📝 **Smart Summaries** - AI summarizes long notes (Note Widget)
- ✅ **Task Suggestions** - Get AI-powered task recommendations (Task Widget)
- 📊 **Data Insights** - Analyze chart data with AI (Chart Widget)
- 💬 **Chat Assistant** - AI responds to team conversations (Chat Widget)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React, Tailwind CSS |
| **State** | Zustand (client state), Supabase (server state) |
| **Database** | Supabase PostgreSQL + Realtime |
| **Auth** | Clerk |
| **AI** | Groq (Llama 3.3 70B) |
| **UI Components** | shadcn/ui, Framer Motion |
| **Charts** | Recharts |
| **Grid** | react-grid-layout |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account
- Clerk account
- Groq API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/socheema/synkboard.git
cd synkboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq AI
GROQ_API_KEY=your_groq_api_key
```

4. **Set up Supabase database**

Run the SQL schema from `docs/database-schema.sql` in your Supabase SQL editor.

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating a Workspace
1. Sign in to SynkBoard
2. Click the workspace dropdown
3. Select "Create Workspace"
4. Share the invite code with team members

### Adding Widgets
1. Click the "+" button (bottom-right)
2. Select widget type
3. Drag to reposition, resize as needed

### AI Features
- **Notes**: Type 50+ characters, click "Summarize with AI"
- **Tasks**: Add tasks, click "AI Task Suggestions"
- **Charts**: Add 2+ data points, click "AI Analyze Data"
- **Chat**: Chat with team, click "Ask AI Assistant"

## 🏗️ Architecture
```
┌─────────────────────────────────────────┐
│          CLIENT (Next.js 15)            │
│  React Components + Zustand State       │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│       REALTIME (Supabase)               │
│  WebSocket Subscriptions (Postgres)     │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│      DATABASE (Supabase PostgreSQL)     │
│  workspaces, widgets, chat_messages     │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│          AI LAYER (Groq API)            │
│      Llama 3.3 70B (cached)             │
└─────────────────────────────────────────┘
```

## 🎨 Project Structure
```
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Protected routes
│   └── api/               # API routes (AI)
├── components/
│   ├── board/             # Board & grid components
│   ├── widgets/           # Widget implementations
│   ├── workspace/         # Workspace management
│   └── ui/                # shadcn components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── store/             # Zustand stores
│   └── ai/                # AI utilities
└── hooks/                 # Custom React hooks
```

## 🔒 Security

- Row Level Security (RLS) on Supabase
- Clerk middleware protects routes
- API rate limiting (10 req/min)
- Environment variables for secrets
- CORS configured for production

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
2. **Import to Vercel**
3. **Add environment variables** (same as `.env.local`)
4. **Deploy**

### Environment Setup
- Set up Clerk production instance
- Update Supabase RLS policies for production
- Configure Groq API rate limits

## 📊 Performance

- **Initial Load**: ~1.2s (with code splitting)
- **Real-time Latency**: ~100-200ms
- **AI Response Time**: ~2-5s (Groq)
- **Bundle Size**: ~250KB gzipped

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Clerk](https://clerk.com/)
- [Groq](https://groq.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## 📧 Contact

A. Chima - [https://x.com/tech_chi]

Project Link: [https://github.com/socheema/synkboard]
---

Made with ❤️ and ☕ by Azubuike Chima
