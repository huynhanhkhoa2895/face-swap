# Face Swap Backend

NestJS backend for face swap video processing.

## Features

- TypeScript strict mode (no 'any' types)
- Face detection using face-api.js
- Video processing with FFmpeg
- In-memory async processing
- In-memory user quota tracking
- File upload handling

## Prerequisites

- Node.js >= 18.17.0
- FFmpeg installed on system
- **@tensorflow/tfjs-node** (REQUIRED - see `INSTALL_TENSORFLOW.md`)
- Face-api.js models in `src/models/` directory (downloaded automatically or manually)

## Setup

1. **Install TensorFlow.js Node.js (REQUIRED for face detection - main feature):**

```bash
# See INSTALL_TENSORFLOW.md for detailed instructions
# Or run the helper script:
.\install-tensorflow.ps1

# Or manually:
npm install @tensorflow/tfjs-node
```

**Prerequisites for Windows:**

- Python 3.x (add to PATH)
- Visual Studio Build Tools with C++ workload

2. Install other dependencies:

```bash
npm install
```

3. Install FFmpeg (if not already installed):
   - Windows: Download from https://ffmpeg.org/download.html
   - macOS: `brew install ffmpeg`
   - Linux: `sudo apt-get install ffmpeg`

4. Download face-api.js models (optional - downloaded automatically on first use):
   - Download models from: https://github.com/vladmandic/face-api/tree/master/model
   - Place in `src/models/` directory:
     - ssd_mobilenetv1_model-weights_manifest.json
     - ssd_mobilenetv1_model-shard1
     - face_landmark_68_model-weights_manifest.json
     - face_landmark_68_model-shard1
     - face_recognition_model-weights_manifest.json
     - face_recognition_model-shard1
     - face_recognition_model-shard2

5. Create `.env` file:

```
PORT=3001
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOADS_PATH=uploads
OUTPUTS_PATH=outputs
TEMPLATES_PATH=templates
TEMP_PATH=temp
MODELS_PATH=src/models
```

6. Run development server:

```bash
npm run start:dev
```

## API Endpoints

- `POST /face-swap/upload` - Upload image and start processing
- `GET /face-swap/status/:jobId` - Get job status
- `GET /face-swap/download/:jobId` - Download completed video
- `GET /templates` - Get all templates
- `GET /templates/filter` - Filter templates by character/gender
- `GET /templates/:id` - Get template by ID

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── config/
├── modules/
│   ├── face-swap/
│   ├── template/
│   └── user-tracking/
├── uploads/
├── outputs/
├── templates/
└── temp/
```
