# Face Swap Backend Refactoring Summary

## Overview

The face swap backend has been refactored from an AI-based face detection approach to a simpler template-based overlay system. This eliminates complex native dependencies and makes the system easier to deploy and maintain.

## Changes Made

### 1. Dependencies Removed

The following AI/ML dependencies have been removed from `package.json`:
- `@vladmandic/face-api` - Face detection library
- `@tensorflow/tfjs-node` - TensorFlow.js for Node.js
- `canvas` - Canvas library with native dependencies

### 2. Dependencies Kept

The following dependencies are still used:
- `sharp` - Image processing (pure JavaScript, no native dependencies)
- `fluent-ffmpeg` - Video processing
- `@ffmpeg-installer/ffmpeg` - FFmpeg binary installer

### 3. New Services Created

**SimpleFaceSwapService** (`src/modules/face-swap/services/simple-face-swap.service.ts`)
- Template-based face overlay system
- Uses Sharp for image compositing
- Supports multiple face positions per template (for different frame ranges)
- Handles rotation and resizing of user faces

### 4. Updated Services

**TemplateService** (`src/modules/template/template.service.ts`)
- Now loads template metadata from JSON files in `templates/metadata/`
- Implements `OnModuleInit` to load templates on startup
- Supports filtering by character and gender

**FaceSwapProcessor** (`src/modules/face-swap/processors/face-swap.processor.ts`)
- Updated to use `SimpleFaceSwapService` instead of AI-based services
- Removed face detection validation step
- Simplified processing flow

**Template Entity** (`src/modules/template/entities/template.entity.ts`)
- Updated to support multiple face positions with frame ranges
- Added `totalFrames` field
- Added optional `audioPath` field
- Changed `facePosition` (single) to `facePositions` (array)

### 5. Module Updates

**FaceSwapModule** (`src/modules/face-swap/face-swap.module.ts`)
- Removed `FaceDetectionService` and old `FaceSwapService`
- Added `SimpleFaceSwapService`
- Added `ConfigModule` import

### 6. Helper Scripts

**create-template-metadata.js** (`scripts/create-template-metadata.js`)
- Utility script to generate template metadata files
- Extracts video metadata (duration, fps, resolution)
- Creates default face position based on video dimensions

## Template Metadata Structure

Each template requires a JSON metadata file in `templates/metadata/`:

```json
{
  "id": "colleague-male",
  "name": "Colleague Battle - Male",
  "character": "colleague",
  "gender": "male",
  "videoPath": "templates/videos/colleague-male.mp4",
  "thumbnailPath": "templates/thumbnails/colleague-male.jpg",
  "audioPath": "templates/audio/colleague-male.mp3",
  "duration": 10,
  "fps": 30,
  "resolution": {
    "width": 1920,
    "height": 1080
  },
  "totalFrames": 300,
  "facePositions": [
    {
      "x": 760,
      "y": 240,
      "width": 400,
      "height": 520,
      "rotation": 0,
      "frameStart": 0,
      "frameEnd": 90
    }
  ],
  "createdAt": "2025-11-22T00:00:00.000Z",
  "updatedAt": "2025-11-22T00:00:00.000Z"
}
```

## How to Create a Template

1. **Prepare your video file**
   - Place it in `templates/videos/`
   - Ensure it has good quality and consistent face positions

2. **Generate metadata**
   ```bash
   node scripts/create-template-metadata.js ./templates/videos/colleague-male.mp4 colleague male
   ```

3. **Edit face positions**
   - Open the generated JSON file in `templates/metadata/`
   - Adjust `facePositions` array with correct coordinates
   - Use a video editor or image viewer to determine exact pixel coordinates
   - Add multiple positions if the face moves during the video

4. **Add thumbnail and audio** (optional)
   - Place thumbnail in `templates/thumbnails/`
   - Place audio file in `templates/audio/` (if separate from video)

## Face Position Coordinates

Face positions are defined in pixels:
- `x`: Distance from left edge of video
- `y`: Distance from top edge of video
- `width`: Width of face region
- `height`: Height of face region
- `rotation`: Rotation angle in degrees (optional)
- `frameStart`: Starting frame number (0-indexed, optional)
- `frameEnd`: Ending frame number (0-indexed, optional)

If `frameStart` and `frameEnd` are omitted, the position applies to all frames.

## Benefits of New Approach

✅ **No native dependencies** - Easier installation and deployment
✅ **Faster processing** - No AI inference overhead
✅ **More predictable** - Consistent results based on template metadata
✅ **Easier to debug** - Simple overlay logic, no ML model issues
✅ **Cross-platform** - Works on any platform without compilation
✅ **Lower resource usage** - No GPU or heavy CPU requirements

## Migration Notes

### Old Services (Can be deleted)

The following files are no longer used and can be safely deleted:
- `src/modules/face-swap/services/face-detection.service.ts`
- `src/modules/face-swap/services/face-swap.service.ts` (old AI-based version)

### Configuration

No changes needed to configuration. The system uses the same paths:
- `paths.templates` - Template directory (default: `./templates`)
- `paths.temp` - Temporary files (default: `./temp`)
- `paths.outputs` - Output videos (default: `./outputs`)

### API Compatibility

The API endpoints remain the same:
- `POST /face-swap/upload` - Upload image and process
- `GET /face-swap/status/:jobId` - Get job status
- `GET /face-swap/download/:jobId` - Get download URL
- `GET /templates` - List templates
- `GET /templates/:id` - Get template details

## Testing

To test the new system:

1. **Create a test template**
   ```bash
   node scripts/create-template-metadata.js ./test-video.mp4 colleague male
   ```

2. **Edit the metadata file** with correct face positions

3. **Start the server**
   ```bash
   npm run start:dev
   ```

4. **Upload an image** via the API and verify the face swap works correctly

## Next Steps

1. Create template metadata files for all existing video templates
2. Test with various user images
3. Fine-tune face positions for best results
4. Consider adding support for multiple faces per frame (if needed)

