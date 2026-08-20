# Job Tracker 🚀

A modern full-stack Job Application Tracker built with **Next.js**, **React**, **Tailwind CSS**, and **TypeScript**, packaged with **Docker** multi-stage builds and ready for deployment on **Vercel** or any cloud container infrastructure.

---

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI & Styling:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Charts & Visuals:** [Recharts](https://recharts.org/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Containerization & DevOps:** [Docker](https://www.docker.com/) (Multi-stage build), Docker Compose
- **Deployment:** [Vercel](https://vercel.com/) / Container Clouds (AWS ECS, GCP Cloud Run, Render, VPS)

---

## 🚀 Getting Started

### Option 1: Running with Docker (Recommended for Container Showcase)

Make sure you have [Docker](https://docs.docker.com/get-docker/) installed.

```bash
# Build and start the container
docker compose up --build

# Or run using Docker CLI directly:
docker build -t job-tracker:latest .
docker run -p 3000:3000 job-tracker:latest
```

The app will be live at [http://localhost:3000](http://localhost:3000).

---

### Option 2: Local Development (Node.js)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🐳 Docker Architecture Highlights

- **Multi-Stage Build Pipeline:**
  - `deps`: Installs production and build dependencies cleanly with `npm ci`.
  - `builder`: Compiles Next.js with standalone output optimization.
  - `runner`: Uses a minimal `alpine` base image, non-root user (`nextjs`) for container security, and runs standalone Next.js server with minimal footprint.
- **Standalone Output:** Next.js automatic dependency tracing bundles only required production node modules, reducing image size drastically.

---

## ☁️ Deployment

### Deploying to Vercel
1. Push your code to GitHub / GitLab / Bitbucket.
2. Import your repository into [Vercel](https://vercel.com/new).
3. Vercel automatically detects Next.js and deploys serverless and edge functions seamlessly.

### Deploying to Container Platforms
Use the included `Dockerfile` to deploy anywhere:
- **AWS ECS / EKS**
- **Google Cloud Run**
- **DigitalOcean App Platform / Droplets**
- **Railway / Render / Fly.io**
