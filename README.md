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

## 🐳 Production Deployment (High-Performance VPS)

This repository is optimized for an **Enterprise-Grade VPS (4 CPUs, 8GB RAM)**. The `docker-compose.prod.yml` is tuned to allocate maximum memory to the backend and the pgvector database for optimal performance.

### Rolling Update (Zero-Downtime Deployment)
If the system is already deployed and you want to update it to the latest version on the server, execute these commands inside your VPS via SSH:

```bash
# 1. Go to your project directory
cd /path/to/your/project/MiWeb

# 2. Pull the latest code
git pull origin main

# 3. Rebuild the optimized Docker images
docker-compose -f docker-compose.prod.yml build

# 4. Bring up the containers (replaces the old ones)
docker-compose -f docker-compose.prod.yml up -d

# 5. Apply the latest Prisma database migrations safely
docker exec -it miweb-backend-1 npx prisma migrate deploy

# 6. Seed the database (updates dynamic pricing and default CMS data)
docker exec -it miweb-backend-1 npx prisma db seed
```

> **Security Warning**: Because this code contains business-critical simulations and financial configurations, ensure this GitHub repository is set to **Private**.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
