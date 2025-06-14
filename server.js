
// Backend Server Code (Node.js + Express)
// Save this as server.js and run separately from your React app
// 
// Installation: npm install express multer cors helmet ratelimit
// Usage: node server.js

const express = require('express');
// ... keep existing code
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-Original-Filename', 'X-Original-Mimetype'],
}));

// Rate limiting
const uploadLimiter = rateLimit({
// ... keep existing code
  message: 'Too many uploads, please try again later'
});

const downloadLimiter = rateLimit({
// ... keep existing code
  message: 'Too many downloads, please try again later'
});

// Configure multer for file uploads
const storage = multer.diskStorage({
// ... keep existing code
    const uniqueId = crypto.randomUUID();
    cb(null, uniqueId);
  }
});

const upload = multer({
// ... keep existing code
    // Accept all file types since files are encrypted
    cb(null, true);
  }
});

// File metadata storage (in production, use a database)
const fileMetadata = new Map();

// Upload endpoint
app.post('/api/upload', uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = req.file.filename;
    const originalName = req.body.originalName || 'unknown';
    const mimeType = req.body.mimeType || 'application/octet-stream';
    
    // Store metadata
    fileMetadata.set(fileId, {
      originalName,
      mimeType,
      uploadDate: new Date(),
      filePath: req.file.path,
      size: req.file.size
    });

    // Schedule file deletion after 7 days
    setTimeout(async () => {
// ... keep existing code
        console.error(`Failed to auto-delete file ${fileId}:`, error);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    res.json({
      fileId,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Download endpoint
app.get('/api/download/:fileId', downloadLimiter, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Check if file exists in metadata
    const metadata = fileMetadata.get(fileId);
    if (!metadata) {
      return res.status(404).json({ error: 'File not found or has expired' });
    }

    // Check if file still exists on disk
    try {
      await fs.access(metadata.filePath);
    } catch (error) {
      fileMetadata.delete(fileId);
      return res.status(404).json({ error: 'File not found or has expired' });
    }

    // Set headers
    res.setHeader('X-Original-Filename', metadata.originalName);
    res.setHeader('X-Original-Mimetype', metadata.mimeType);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName}"`);

    // Stream the file
    const fileStream = require('fs').createReadStream(metadata.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
// ... keep existing code
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// File info endpoint (optional)
app.get('/api/info/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const metadata = fileMetadata.get(fileId);
    
    if (!metadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      originalName: metadata.originalName,
      uploadDate: metadata.uploadDate,
      size: metadata.size,
      mimeType: metadata.mimeType
    });

  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// Health check
app.get('/health', (req, res) => {
// ... keep existing code
});

// Error handling middleware
app.use((error, req, res, next) => {
// ... keep existing code
  
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
// ... keep existing code
  console.log(`Upload directory: ${UPLOADS_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
// ... keep existing code
  process.exit(0);
});

process.on('SIGINT', () => {
// ... keep existing code
  process.exit(0);
});
