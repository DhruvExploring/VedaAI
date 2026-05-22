# VedaAI -- AI Assessment Creator

VedaAI is a production-grade web application designed for academic environments. It empowers educators to generate highly customized, curriculum-aligned exam papers using OpenAI GPT-4o, with real-time WebSocket progress tracking, Redis-backed job queueing, and professional PDF export.

**Author: Dhruv Pandey**

---

## System Architecture

VedaAI uses a distributed architecture that decouples the HTTP request-response cycle from the long-running AI generation process. The backend acts as an API gateway and hands off work to an independent BullMQ worker, which communicates back to the client over WebSocket.

```
              +------------------------------+
              |      Next.js 14 Client       |
              |  (Zustand, React Hook Form)  |
              +---------------+--------------+
                              |
                  HTTP REST   |   WebSocket (ws)
               Assignments   |   Real-time progress
                              v
              +------------------------------+
              |     Express API Gateway      |
              |        (TypeScript)          |
              +---------------+--------------+
                              |
       +----------------------+----------------------+
       v                      v                      v
+-------------+     +------------------+     +-----------------+
|   MongoDB   |     |   BullMQ Queue   |     |  OpenAI Service |
| (Data Store)|     | (Job Management) |     |   (GPT-4o)      |
+-------------+     +---------+--------+     +-----------------+
                              |
                              v
                    +------------------+
                    |  BullMQ Worker   |
                    | (Background Job) |
                    +------------------+
```

### End-to-End Workflow

1. **Assignment Submission** -- The teacher defines parameters (grade, subject, duration, total marks, difficulty, question type counts) and optionally uploads a reference document (PDF/text). This is sent as a `multipart/form-data` POST to the Express API.
2. **Database Registration and Job Queueing** -- The API validates the inputs, creates a pending assignment record in MongoDB, and pushes a generation job to the Redis-backed BullMQ queue. The client receives a `202 Accepted` response with an `assignmentId`, preventing timeout.
3. **WebSocket Subscription** -- The client opens a WebSocket connection, subscribing to live updates for the specific `assignmentId`.
4. **Background Processing** -- The BullMQ worker picks up the job, retrieves reference content from MongoDB, builds a structured prompt, and calls the OpenAI GPT-4o API requesting a structured JSON response.
5. **Progress Broadcasting** -- As the worker transitions through steps (prompt construction, LLM call, validation, storage), it publishes progress percentages over WebSocket to the client's Zustand store, updating the UI progress bar live.
6. **Validation and Storage** -- The worker parses the JSON paper, runs structural validation (question schema, MCQ options, difficulty distribution, marks totals), saves the completed `GeneratedPaper` document to MongoDB, and marks the job as completed.
7. **Paper Ready** -- The client receives a terminal `completed` status over WebSocket, renders a clean print-ready paper, and exposes a PDF download button.

---

## Project Structure

```
ai-assessment-creator/
|-- docker-compose.yml       # Multi-container production configuration
|-- Dockerfile               # Multi-stage consolidated build
|-- dev.sh                   # Local dev orchestrator (runs infra in Docker, frontend locally)
|-- pm2.config.js            # PM2 cluster configuration for bare-metal deployment
|-- .dockerignore            # Docker build context exclusions
|-- .gitignore               # Repository source control ignore rules
|-- .env.example             # Master environment variable template
|
|-- backend/                 # Express API and background worker
|   |-- src/
|   |   |-- index.ts         # Express server, middleware, WebSocket server init
|   |   |-- worker.ts        # BullMQ background job processor
|   |   |-- models/
|   |   |   +-- Assignment.ts # Mongoose models for assignments and generated papers
|   |   |-- routes/
|   |   |   +-- assignments.ts # REST routes: create, view, delete, regenerate
|   |   |-- services/
|   |   |   |-- aiGenerator.ts  # OpenAI integration and prompt engineering
|   |   |   |-- queue.ts        # BullMQ connection and queue setup
|   |   |   +-- websocket.ts    # WebSocket connection map and broadcast helper
|   |   +-- types/
|   |       +-- index.ts     # Global TypeScript type declarations
|   |-- logs/                # Runtime audit logs (combined.log, error.log)
|   |-- tsconfig.json
|   +-- package.json
|
+-- frontend/                # Next.js 14 client application
    |-- src/
    |   |-- app/
    |   |   |-- page.tsx               # Root redirect page
    |   |   |-- assignments/
    |   |   |   |-- page.tsx           # Assignment list dashboard
    |   |   |   +-- create/page.tsx    # Assignment creation form
    |   |   +-- output/[id]/page.tsx   # Generated question paper view and PDF export
    |   |-- store/
    |   |   +-- assessmentStore.ts     # Zustand global state (job status, paper result)
    |   |-- lib/
    |   |   |-- api.ts                 # Axios HTTP client wrappers
    |   |   |-- useWebSocket.ts        # WebSocket hook (connects, updates store)
    |   |   +-- pdfExport.ts           # jsPDF paper layout renderer
    |   +-- types/
    |       +-- index.ts               # Shared frontend TypeScript types
    |-- public/                        # Static assets (logo)
    |-- tailwind.config.js
    +-- package.json
```

---

## Environment Configuration

The system uses separate environment files for the backend and frontend. A master template is provided at `.env.example` in the project root.

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ai-assessment
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-proj-yourActualOpenAiKeyHere
FRONTEND_URL=http://localhost:3000
```

When running via Docker Compose, use container hostnames instead:
```env
MONGODB_URI=mongodb://mongodb:27017/ai-assessment
REDIS_URL=redis://redis:6379
```

### Frontend (`frontend/.env.local`)

Create a `.env.local` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

---

## Local Development

VedaAI ships with a `dev.sh` orchestrator that handles the full local setup automatically: infrastructure runs in Docker for consistency, while the Next.js frontend runs locally with hot-reloading.

### Automated Setup (Recommended)

1. Make sure **Docker Desktop** is running.
2. Create the backend and frontend `.env` files as described above.
3. From the project root, run:

```bash
chmod +x ./dev.sh
./dev.sh
```

The script will:
- Verify Docker is running.
- Start `mongodb` and `redis` in Docker containers.
- Start the `veda-backend` Express server and BullMQ worker in Docker.
- Install frontend npm dependencies locally if needed.
- Launch the Next.js dev server at [http://localhost:3000](http://localhost:3000) with hot-reloading.

---

### Manual Setup (Per-Terminal)

If you prefer to launch components individually:

**1. Start databases:**
```bash
docker compose up -d mongodb redis
```

**2. Start the backend API:**
```bash
cd backend
npm install
npm run dev
```

**3. Start the frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Deployment

### Docker Compose (Recommended)

Deploys all services in a single command:

```bash
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY
docker compose up --build -d
```

Services exposed after startup:
- Frontend UI: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)

---

### PM2 on Bare Metal (EC2, DigitalOcean, etc.)

**1. Build production bundles:**
```bash
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
```

**2. Start the PM2 cluster:**
```bash
cd ..
pm2 start pm2.config.js
```

PM2 manages the backend server, BullMQ worker, and Next.js process, with automatic restart on crash.

---

## Logs and Monitoring

### Docker Compose

```bash
# All services
docker compose logs -f

# Backend API only
docker compose logs -f veda-backend

# Background worker only
docker compose logs -f worker
```

### Local Node Process

Log files are written to `backend/logs/`:

```bash
# Live backend activity
tail -f backend/logs/combined.log

# Errors only
tail -f backend/logs/error.log
```

---

## Technology Stack

| Component | Technology |
| :--- | :--- |
| AI Model | OpenAI GPT-4o via structured JSON response |
| Job Queue | BullMQ backed by Redis |
| Real-time | WebSocket (`ws` library) |
| Backend | Node.js 20, Express, TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Frontend | Next.js 14 (App Router), TypeScript |
| State Management | Zustand |
| Form Handling | React Hook Form |
| PDF Export | jsPDF |
| Containerization | Docker, Docker Compose |
| Process Manager | PM2 |

---

**Author: Dhruv Pandey**
