const uploadService = require('../services/uploadService');
const path = require('path');
const fs = require('fs');

exports.startUpload = (req, res) => {
  const fileId = uploadService.generateFileId();
  res.json({ fileId, chunkSize: uploadService.getChunkSize() });
};

exports.uploadChunk = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No chunk uploaded' });
    }
    
    const result = await uploadService.handleChunkUpload(
      req.body.fileId,
      req.body.chunkIndex,
      req.file
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeUpload = async (req, res) => {
  try {
    const { fileId, fileName } = req.body;
    const result = await uploadService.mergeChunks(fileId, fileName);
    
    res.json(result);
  } catch (error) {
    console.error('Error merging chunks:', error);
    res.status(500).json({ error: 'Failed to merge chunks' });
  }
};