# Template Metadata

This directory contains JSON metadata files for each video template.

## Template Metadata Structure

Each template JSON file should follow this structure:

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
    },
    {
      "x": 800,
      "y": 220,
      "width": 380,
      "height": 500,
      "rotation": 5,
      "frameStart": 91,
      "frameEnd": 300
    }
  ],
  "createdAt": "2025-11-22T00:00:00.000Z",
  "updatedAt": "2025-11-22T00:00:00.000Z"
}
```

## Creating Template Metadata

Use the helper script to generate a template metadata file:

```bash
node scripts/create-template-metadata.js <videoPath> <character> <gender>
```

Example:
```bash
node scripts/create-template-metadata.js ./templates/videos/colleague-male.mp4 colleague male
```

This will create a basic template file with default face positions. You'll need to manually adjust the `facePositions` array with the correct coordinates for your video.

## Face Positions

Each face position defines:
- `x`, `y`: Top-left corner coordinates (in pixels)
- `width`, `height`: Size of the face region (in pixels)
- `rotation`: Optional rotation angle in degrees
- `frameStart`: Optional starting frame number (0-indexed)
- `frameEnd`: Optional ending frame number (0-indexed)

If `frameStart` and `frameEnd` are omitted, the position applies to all frames.

## Multiple Face Positions

You can define multiple face positions for different frame ranges. This is useful when:
- The face moves during the video
- The face size changes
- The face rotates

The system will automatically select the appropriate position based on the current frame number.

