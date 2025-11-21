# Installing TensorFlow.js Node.js (Required for Face Detection)

Face detection is the **main feature** of this application. To enable it, you need to install `@tensorflow/tfjs-node`, which requires native compilation on Windows.

## Prerequisites for Windows

### 1. Install Python 3.x

- Download from: https://www.python.org/downloads/
- **Important**: Check "Add Python to PATH" during installation
- Verify installation:
  ```powershell
  python --version
  ```

### 2. Install Visual Studio Build Tools

- Download "Build Tools for Visual Studio" from: https://visualstudio.microsoft.com/downloads/
- Run the installer and select **"Desktop development with C++"** workload
- This includes:
  - MSVC v143 - VS 2022 C++ x64/x86 build tools
  - Windows 10/11 SDK
  - C++ CMake tools

### 3. Install Windows Build Tools (Alternative)

If you prefer npm-based installation:

```powershell
npm install --global windows-build-tools
```

**Note**: This package is deprecated but may still work.

## Installation Steps

### Step 1: Install TensorFlow.js Node.js

```powershell
cd face-swap-backend
npm install @tensorflow/tfjs-node
```

This will:

1. Download pre-built binaries (if available for your platform)
2. Fall back to building from source if binaries aren't available
3. May take 5-15 minutes depending on your internet connection

### Step 2: Verify Installation

After installation, verify it works:

```powershell
npm run build
npm run start:dev
```

You should see:

```
LOG [FaceDetectionService] Face detection models loaded successfully
```

Instead of:

```
WARN [FaceDetectionService] Face-api dependencies not available
```

## Troubleshooting

### Error: "node-gyp rebuild failed"

**Solution**: Make sure Visual Studio Build Tools are installed with C++ workload.

### Error: "Python not found"

**Solution**:

1. Install Python 3.x
2. Add Python to PATH
3. Restart your terminal/PowerShell
4. Verify: `python --version`

### Error: "Cannot find module '@tensorflow/tfjs-node'"

**Solution**:

1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

### Error: "Building TensorFlow Node.js bindings" takes forever

**Solution**:

- This is normal for the first build
- It may take 10-30 minutes
- Make sure you have a stable internet connection
- The build downloads TensorFlow binaries (~100-200MB)

## Alternative: Use Pre-built Binaries

If building fails, try installing a specific version with pre-built binaries:

```powershell
npm install @tensorflow/tfjs-node@4.15.0 --build-from-source=false
```

## Alternative: Use Docker (Recommended for Production)

If native compilation is problematic, use Docker:

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++
# ... rest of Dockerfile
```

## After Installation

Once `@tensorflow/tfjs-node` is installed:

1. **Download Face-API Models** (if not already downloaded):

   ```powershell
   # Models will be downloaded automatically on first use
   # Or download manually to src/models/:
   # - ssd_mobilenetv1_model-weights_manifest.json
   # - ssd_mobilenetv1_model-shard1
   # - face_landmark_68_model-weights_manifest.json
   # - face_landmark_68_model-shard1
   # - face_recognition_model-weights_manifest.json
   # - face_recognition_model-shard1
   ```

2. **Start the server**:

   ```powershell
   npm run start:dev
   ```

3. **Verify face detection works** by uploading an image through the API.

## Quick Install Script

Create a file `install-tensorflow.ps1`:

```powershell
Write-Host "Installing @tensorflow/tfjs-node..." -ForegroundColor Yellow
Write-Host "This may take 10-30 minutes..." -ForegroundColor Yellow

npm install @tensorflow/tfjs-node

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ TensorFlow.js installed successfully!" -ForegroundColor Green
    Write-Host "Face detection is now enabled." -ForegroundColor Green
} else {
    Write-Host "✗ Installation failed. Please check prerequisites:" -ForegroundColor Red
    Write-Host "  1. Python 3.x installed and in PATH" -ForegroundColor Yellow
    Write-Host "  2. Visual Studio Build Tools with C++ workload" -ForegroundColor Yellow
}
```

Run it:

```powershell
.\install-tensorflow.ps1
```

