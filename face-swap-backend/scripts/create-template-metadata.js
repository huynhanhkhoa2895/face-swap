const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

/**
 * Get video metadata using FFprobe
 */
async function getVideoInfo(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata);
    });
  });
}

/**
 * Parse frame rate from FFmpeg format (e.g., "30/1" -> 30)
 */
function parseFps(fpsString) {
  const parts = fpsString.split('/');
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return denominator > 0 ? numerator / denominator : 30;
  }
  return parseFloat(fpsString) || 30;
}

/**
 * Create template metadata JSON file
 */
async function createTemplateMetadata(videoPath, character, gender) {
  try {
    const metadata = await getVideoInfo(videoPath);
    const videoStream = metadata.streams.find((s) => s.codec_type === 'video');

    if (!videoStream) {
      throw new Error('No video stream found in file');
    }

    const duration = parseFloat(metadata.format.duration) || 0;
    const fps = parseFps(videoStream.r_frame_rate || '30/1');
    const width = videoStream.width || 1920;
    const height = videoStream.height || 1080;
    const totalFrames = Math.ceil(duration * fps);

    const template = {
      id: `${character}-${gender}`,
      name: `${character.charAt(0).toUpperCase() + character.slice(1)} Battle - ${gender.charAt(0).toUpperCase() + gender.slice(1)}`,
      character,
      gender,
      videoPath: `templates/videos/${character}-${gender}.mp4`,
      thumbnailPath: `templates/thumbnails/${character}-${gender}.jpg`,
      audioPath: `templates/audio/${character}-${gender}.mp3`,
      duration,
      fps,
      resolution: {
        width,
        height,
      },
      totalFrames,
      facePositions: [
        {
          x: Math.round(width * 0.4), // Default: 40% from left
          y: Math.round(height * 0.2), // Default: 20% from top
          width: Math.round(width * 0.2), // Default: 20% of width
          height: Math.round(height * 0.5), // Default: 50% of height
          rotation: 0,
          frameStart: 0,
          frameEnd: totalFrames - 1,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ensure templates/metadata directory exists
    const templatesDir = path.join(process.cwd(), 'templates');
    const metadataDir = path.join(templatesDir, 'metadata');

    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }

    const outputPath = path.join(metadataDir, `${character}-${gender}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
    console.log(`✅ Template metadata created: ${outputPath}`);
    console.log('⚠️  Please update facePositions manually with correct coordinates');
    console.log(`   Video dimensions: ${width}x${height}`);
    console.log(`   Total frames: ${totalFrames} (${duration}s @ ${fps} fps)`);
  } catch (error) {
    console.error(`❌ Error creating template metadata: ${error.message}`);
    process.exit(1);
  }
}

// Usage: node create-template-metadata.js <videoPath> <character> <gender>
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: node create-template-metadata.js <videoPath> <character> <gender>');
  console.error('Example: node create-template-metadata.js ./video.mp4 colleague male');
  process.exit(1);
}

const [videoPath, character, gender] = args;

// Validate character
const validCharacters = ['colleague', 'boss', 'homie'];
if (!validCharacters.includes(character)) {
  console.error(`❌ Invalid character: ${character}`);
  console.error(`   Valid characters: ${validCharacters.join(', ')}`);
  process.exit(1);
}

// Validate gender
const validGenders = ['male', 'female'];
if (!validGenders.includes(gender)) {
  console.error(`❌ Invalid gender: ${gender}`);
  console.error(`   Valid genders: ${validGenders.join(', ')}`);
  process.exit(1);
}

// Check if video file exists
if (!fs.existsSync(videoPath)) {
  console.error(`❌ Video file not found: ${videoPath}`);
  process.exit(1);
}

createTemplateMetadata(videoPath, character, gender);

