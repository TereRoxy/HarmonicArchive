const path = require('path');
const fs = require('fs');
const multer = require('multer');

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// Configure chunk storage
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileId = req.body.fileId;
    const tempDir = path.join(TEMP_DIR, fileId);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.chunkIndex}.part`);
  }
});

exports.chunkUpload = multer({ storage: chunkStorage });

exports.generateFileId = () => {
  return Date.now().toString();
};

exports.getChunkSize = () => {
  return CHUNK_SIZE;
};

exports.handleChunkUpload = (fileId, chunkIndex, file) => {
  return {
    success: true,
    chunkIndex,
    fileId
  };
};

exports.mergeChunks = (fileId, fileName) => {
  const tempDir = path.join(TEMP_DIR, fileId);
  const finalPath = path.join(UPLOAD_DIR, `${fileId}_${fileName}`);
  
  // Get all chunk files
  const chunks = fs.readdirSync(tempDir)
    .filter(f => f.endsWith('.part'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  // Merge chunks
  const writeStream = fs.createWriteStream(finalPath);
  for (const chunk of chunks) {
    const chunkPath = path.join(tempDir, chunk);
    writeStream.write(fs.readFileSync(chunkPath));
    fs.unlinkSync(chunkPath); // Delete chunk after merging
  }
  writeStream.end();
  
  // Clean up
  fs.rmdirSync(tempDir);
  
  return {
    success: true,
    filePath: `/uploads/${fileId}_${fileName}`
  };
};