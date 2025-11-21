# Face Swap Video Project

A complete face swap video application similar to JibJab, built with NestJS backend and Next.js 15 frontend.

## Project Structure

```
face-swap/
├── face-swap-backend/     # NestJS backend
└── face-swap-frontend/    # Next.js 15 frontend
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:

```bash
cd face-swap-backend
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables (copy `.env.example` to `.env`)

4. Install FFmpeg and Redis

5. Download face-api.js models to `src/models/`

6. Start Redis server

7. Run backend:

```bash
npm run start:dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd face-swap-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables (copy `.env.example` to `.env.local`)

4. Run frontend:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Features

- ✅ TypeScript strict mode (no 'any' types)
- ✅ Face detection using face-api.js
- ✅ Video processing with FFmpeg
- ✅ Queue-based async processing
- ✅ User quota tracking (1 generation per user)
- ✅ Modern UI with Tailwind CSS
- ✅ Next.js 15 App Router
- ✅ Type-safe API client

## Technology Stack

### Backend

- NestJS
- TypeScript (strict mode)
- FFmpeg
- face-api.js
- Bull (Redis queue)
- Sharp (image processing)
- Canvas

### Frontend

- Next.js 15
- React 19
- TypeScript (strict mode)
- Tailwind CSS
- Zustand
- Axios

## Development

See individual README files in each project directory for detailed setup instructions.

## License

MIT
