# Contributing To MiWeb

Thank you for your interest in contributing to MiWeb! 

## Code Standards
- Use TypeScript for all new code.
- Follow the established directory structure.
- Write clean, documented code.

## Pull Requests
1. Fork the repo.
2. Create your feature branch.
3. Commit your changes.
4. Push and open a PR.

## Development Setup

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** v15+
- **Redis** v7+
- **Docker** & Docker Compose (for production deployment)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/haroldfabla2-hue/Miportafolio.git
cd Miportafolio

# Backend setup
cd backend
cp .env.example .env          # Configure your environment variables
npm install
npx prisma migrate dev        # Run database migrations
npm run start:dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── auth/           # JWT authentication & guards
│   │   ├── cms/            # CMS content management
│   │   ├── crm/            # CRM (projects, clients, pipeline)
│   │   ├── google/         # Google Drive & Gmail integration
│   │   ├── iris/           # AI assistant (Iris agent)
│   │   └── users/          # User management & roles
│   └── prisma/             # Database schema & migrations
├── frontend/         # React + Vite SPA
│   └── src/
│       ├── admin/          # CRM admin panel (Iris)
│       ├── components/     # Public portfolio site
│       ├── context/        # React contexts (Auth, Socket)
│       └── services/       # API client & utilities
```

## Development Guidelines

### Code Style
- **TypeScript** is mandatory for all new files
- Use `strict` mode — no `any` types unless absolutely necessary
- Follow NestJS conventions for backend (controllers, services, modules)
- Use functional React components with hooks for frontend

### Branching Strategy
- `main` — production-ready code
- `develop` — integration branch for feature work
- `feature/<name>` — individual feature branches
- `fix/<name>` — bugfix branches

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add content preview to CMS editor
fix: resolve drag-drop type error in tasks
docs: update API documentation
refactor: split dashboard into lazy-loaded modules
```

### Pull Request Process
1. Create a feature branch from `develop`
2. Write your changes with proper TypeScript types
3. Ensure both `backend` and `frontend` builds pass:
   ```bash
   cd backend && npm run build
   cd frontend && npm run build
   ```
4. Open a pull request against `develop`
5. Request review from a maintainer

## Architecture Decisions

### Frontend Code Splitting
Admin pages use `React.lazy()` for on-demand loading. When adding new admin pages:
1. Create the page component with a `default export`
2. Add a lazy import in `App.tsx`: `const MyPage = lazy(() => import('./admin/pages/MyPage'))`
3. Add the route inside the admin `<Suspense>` wrapper

### Backend Module Pattern
Each feature is a NestJS module with:
- `*.module.ts` — Module definition with imports/exports
- `*.controller.ts` — HTTP endpoint handlers
- `*.service.ts` — Business logic
- Guards and decorators for authorization

### Security
- All admin endpoints require JWT authentication via `JwtAuthGuard`
- Permission-based access uses `@RequiresPermission()` decorator
- Public endpoints use `@Public()` decorator to bypass auth
- Rate limiting is enforced at the Nginx level in production

## Reporting Issues

When opening an issue, please include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Console logs or error screenshots

## License

By contributing, you agree that your contributions will be licensed under the project's existing license.
