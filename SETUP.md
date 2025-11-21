# Setup Guide

## Prerequisites

### For Backend (Windows)

The `canvas` package requires native compilation. You need:

1. **Python 3.x** (for node-gyp)

   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. **Visual Studio Build Tools** (for C++ compilation)

   - Download "Build Tools for Visual Studio" from: https://visualstudio.microsoft.com/downloads/
   - Install "Desktop development with C++" workload

3. **GTK+** (for canvas)
   - Download from: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer
   - Or use: `npm install --global windows-build-tools` (deprecated but may work)

### Alternative: Use Docker or WSL2

If native compilation is problematic, consider:

- Using Docker for the backend
- Using WSL2 (Windows Subsystem for Linux)

## Installation Steps

### 1. Frontend (Already Installed ✅)

```bash
cd face-swap-frontend
npm install
```

### 2. Backend

#### Option A: Install with Canvas (Recommended for Production)

```bash
cd face-swap-backend

# Make sure Python and Build Tools are installed first
npm install
```

#### Option B: Install without Canvas (For Development/Testing)

```bash
cd face-swap-backend

# Install all dependencies except canvas
npm install --ignore-scripts

# Then manually install canvas later when build tools are ready
npm install canvas --build-from-source
```

### 3. Environment Setup

#### Backend `.env` file:

```bash
cd face-swap-backend
copy .env.example .env
```

Edit `.env` with your settings:

```
PORT=3001
FRONTEND_URL=http://localhost:3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Frontend `.env.local` file:

```bash
cd face-swap-frontend
copy .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Install TensorFlow.js Node.js (REQUIRED for Face Detection)

Face detection is the **main feature** of this application. See `face-swap-backend/INSTALL_TENSORFLOW.md` for detailed instructions.

**Quick Install (after prerequisites):**

```bash
cd face-swap-backend
npm install @tensorflow/tfjs-node
```

**Prerequisites:**

- Python 3.x (add to PATH)
- Visual Studio Build Tools with C++ workload

**Note**: Installation may take 10-30 minutes as it builds native bindings.

### 5. Download Face-API Models

1. Download models from: https://github.com/vladmandic/face-api/tree/master/model
2. Create directory: `face-swap-backend/src/models/`
3. Place these files in the models directory:
   - `ssd_mobilenetv1_model-weights_manifest.json`
   - `ssd_mobilenetv1_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`

### 6. Install FFmpeg

**Windows:**

- Download from: https://ffmpeg.org/download.html
- Extract and add to PATH
- Or use: `choco install ffmpeg` (if Chocolatey is installed)

## Starting the Application

### Terminal 1: Start Redis

```bash
redis-server
# Or if using Docker:
docker run -d -p 6379:6379 redis
```

### Terminal 2: Start Backend

```bash
cd face-swap-backend
npm run start:dev
```

### Terminal 3: Start Frontend

```bash
cd face-swap-frontend
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Troubleshooting

### Canvas Installation Issues

If canvas fails to install:

1. Make sure Python is in PATH: `python --version`
2. Install build tools: `npm install --global windows-build-tools`
3. Try: `npm install canvas --build-from-source`

### Redis Connection Issues

- Make sure Redis is running: `redis-cli ping` (should return PONG)
- Check Redis port in `.env` matches your Redis instance

### FFmpeg Not Found

- Verify FFmpeg is in PATH: `ffmpeg -version`
- Update PATH environment variable if needed
