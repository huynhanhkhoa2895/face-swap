export const configuration = () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  },
  paths: {
    uploads: process.env.UPLOADS_PATH || 'uploads',
    outputs: process.env.OUTPUTS_PATH || 'outputs',
    templates: process.env.TEMPLATES_PATH || 'templates',
    temp: process.env.TEMP_PATH || 'temp',
    models: process.env.MODELS_PATH || 'src/models',
  },
});
