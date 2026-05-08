GreenRide OS

A real-time, full-stack operating system for managing a national network of EV battery swap nodes. 

Built with a premium brutalist aesthetic and driven by live data.

Tech Stack
* **Frontend:** Next.js, React, Tailwind CSS
* **Backend:** Express.js, Node.js / Bun
* **Database:** PostgreSQL, Prisma ORM
* **Live Sync:** Socket.io
* **Fintech:** Razorpay API

Quick Start
Make sure PostgreSQL is running and your `.env` is configured.

```bash
# Terminal 1: Start the Brain (Backend)
cd backend
bun install
bun run server.ts

# Terminal 2: Start the Face (Frontend)
cd frontend
bun install
bun run dev
