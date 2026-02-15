# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-10

### Added
- **Public Portfolio Site** — Responsive landing page with projects showcase, services, about, blog, and contact pages
- **CRM Admin Panel (Iris)** — Full-featured admin dashboard with dark theme
  - Dashboard with dynamic widgets and revenue charts
  - Project management with timeline and team assignment
  - Client management with pipeline view
  - Task management with drag-and-drop Kanban board
  - Real-time chat with WebSocket support
  - Gmail integration for email management
  - Google Drive integration for file management
  - AI assistant (Iris) with multi-provider support (Gemini, Kimi, DeepSeek)
  - Oracle — AI-powered business intelligence
  - Finance module with invoice designer and bill management
  - Reports hub with customizable charts
  - Ticket/support management system
  - Role-based access control with permission management
  - Content Management System (CMS) with SEO fields and preview
  - User management with invitation system and onboarding flow
  - Real-time notifications
  - Asset management with Google Drive upload
  - Settings panel with integrations hub
- **Authentication** — JWT-based auth with refresh tokens, 2FA support, and role-based permissions
- **Contact Form** — Public contact form integrated with CRM leads capture
- **Production Infrastructure**
  - Multi-stage Dockerfiles for frontend and backend
  - Docker Compose production configuration with PostgreSQL and Redis
  - Nginx configuration with SSL readiness, rate limiting, security headers, and WebSocket proxy
  - Environment variable template (`.env.example`)
- **Documentation** — README with setup guide, CONTRIBUTING guidelines
- **Performance** — React.lazy code-splitting for admin pages, vendor chunk optimization

### Technical Details
- **Backend**: NestJS, Prisma ORM, PostgreSQL, Redis, Socket.IO
- **Frontend**: React 19, Vite 7 (Rolldown), Framer Motion, Recharts, Lucide Icons
- **AI Providers**: Google Gemini, Kimi/Moonshot, DeepSeek (cascading fallback)
- **Integrations**: Google OAuth2 (Drive + Gmail), WebSocket real-time events
