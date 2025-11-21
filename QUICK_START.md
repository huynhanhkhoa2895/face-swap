# Quick Start Guide

## ✅ What's Already Done

- ✅ Frontend dependencies installed
- ✅ Backend dependencies installed (except canvas - needs build tools)
- ✅ Environment files created

## 🚀 Quick Start (3 Steps)

### Step 1: Install Canvas (Backend - Optional for now)

The `canvas` package needs native compilation. You can skip this for now if you just want to test the frontend.

**If you want to install canvas:**

```bash
cd face-swap-backend

# Option 1: Install build tools first (recommended)
npm install --global windows-build-tools

# Then install canvas
npm install canvas --build-from-source
```

**Or skip canvas for now** - the backend will work but face detection won't function until canvas is installed.

### Step 2: Start Redis

**Option A: Using Docker (Easiest)**

```bash
docker run -d -p 6379:6379 redis
```

**Option B: Download Redis for Windows**

- Download from: https://github.com/microsoftarchive/redis/releases
- Extract and run `redis-server.exe`

**Option C: Use WSL2**

```bash
wsl
sudo apt-get install redis-server
redis-server
```

### Step 3: Start the Application

**Easy Way (Using PowerShell Script):**

```powershell
.\start-dev.ps1
```

**Manual Way:**

**Terminal 1 - Backend:**

```bash
cd face-swap-backend
npm run start:dev
```

**Terminal 2 - Frontend:**

```bash
cd face-swap-frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## ⚠️ Important Notes

1. **Canvas Package**: Face detection requires the `canvas` package. If it's not installed, the backend will start but face detection won't work. See SETUP.md for detailed instructions.

2. **Face-API Models**: Download models from https://github.com/vladmandic/face-api/tree/master/model and place them in `face-swap-backend/src/models/`

3. **FFmpeg**: Required for video processing. Download from https://ffmpeg.org/download.html and add to PATH.

4. **Redis**: Required for queue processing and user quota tracking.

## 🐛 Troubleshooting

### Backend won't start

- Check if Redis is running: `redis-cli ping` (should return PONG)
- Check if port 3001 is available
- Check `.env` file exists in `face-swap-backend/`

### Frontend won't start

- Check if port 3000 is available
- Check `.env.local` file exists in `face-swap-frontend/`
- Try: `npm run dev -- --port 3001` if 3000 is taken

### Canvas installation fails

- Install Python 3.x and add to PATH
- Install Visual Studio Build Tools
- See SETUP.md for detailed instructions

## 📝 Next Steps

1. Download face-api models (see SETUP.md)
2. Install FFmpeg
3. Install canvas package (for face detection)
4. Test the application!

For detailed setup instructions, see `SETUP.md`.
