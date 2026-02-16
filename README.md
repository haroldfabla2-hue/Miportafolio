# MiWeb - Agency OS

MiWeb is a premium agency management system designed for creative studios and digital agencies. It features advanced financial simulations (Oracle), AI-driven insights (Iris), and a comprehensive CRM.

## 🚀 Features

- **Oracle Engine 2.0**: High-precision financial forecasting and resource simulation.
- **Iris AI**: Strategic CFO/COO advisor for data-driven decisions.
- **Finance Hub**: Real-time invoice management, payables/receivables tracking.
- **Projects & CRM**: Kanban pipeline, client management, and document organization.
- **Premium UI**: Glassmorphic, dark-mode design with fluid animations.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: NestJS, Node.js, Prisma (PostgreSQL).
- **AI**: Minimax 2.5 architecture, Iris Engine.
- **Infrastructure**: Docker, Docker Compose.

## 📦 Installation

1. Clone the repository.
2. Setup environment variables in `backend/.env` and `frontend/.env`.
3. Install dependencies: `npm install` in both folders.
4. Run migrations: `npx prisma migrate dev`.
5. Start development servers: `npm run dev`.

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
