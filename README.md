# 🚀 Miportafolio — CRM + Portfolio + AI Agent

A premium, full-stack portfolio platform with integrated CRM, AI agent (Iris), and CMS — designed to manage clients, showcase projects, and automate workflows.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Portfolio Site** | Premium dark-themed website with Framer Motion animations, parallax scrolling, and dynamic project previews via live iframes |
| **CRM System** | Leads management, project tracking, task boards, and analytics dashboard |
| **CMS** | Blog + Portfolio content management with public API, SEO fields, and tagging |
| **Iris AI Agent** | Built-in AI assistant with tool execution (web search, datetime, content generation) and multi-provider cascade (Kimi → GLM → Gemini) |
| **Auth** | JWT authentication with refresh tokens, Google OAuth, and role-based access |
| **Contact → CRM** | Public contact form automatically creates CRM leads with source tracking |

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Framer Motion, Lenis Smooth Scroll  
**Backend:** NestJS, Prisma ORM, PostgreSQL + pgvector, Redis  
**AI:** Gemini, Zhipu GLM, Kimi K2.5, DeepSeek  
**Infra:** Docker, Nginx, GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis

### Setup

```bash
# 1. Clone
git clone https://github.com/haroldfabla2-hue/Miportafolio.git
cd Miportafolio

# 2. Environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# 3. Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Docker (Production)

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📁 Project Structure

```
├── backend/              # NestJS API server
│   ├── src/
│   │   ├── auth/         # JWT + Google OAuth
│   │   ├── cms/          # Content Management System
│   │   ├── crm/          # CRM stats & project endpoints
│   │   ├── iris/         # AI Agent (tools, providers)
│   │   ├── leads/        # Lead management + public contact
│   │   └── prisma/       # Database schema & client
│   └── Dockerfile.prod
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/   # Public website pages
│   │   ├── admin/        # Dashboard, CRM, CMS admin
│   │   ├── hooks/        # Custom React hooks
│   │   └── services/     # API client layer
│   └── Dockerfile
├── docker-compose.prod.yml
├── nginx.conf            # Production Nginx config
└── .env.example
```

## 🔐 Environment Variables

See [`.env.example`](.env.example) for all configuration options including:
- Database connection
- JWT secrets
- AI provider API keys (Gemini, Zhipu, DeepSeek)
- Google OAuth credentials

## 📄 License

MIT
