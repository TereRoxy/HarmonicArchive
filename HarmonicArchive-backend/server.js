const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const generateMusicSheet = require('./generateMusicSheet.js'); // Adjust the path as necessary
const axios = require('axios');

const app = express();
const PORT = 5000;
const IP = '192.168.100.2';


// Enhanced CORS configuration
app.use(cors({
  origin: ['http://192.168.100.2:5173', "http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['Content-Disposition'] // Add this if you need to handle downloads
}));

app.use(bodyParser.json());


// Add these constants at the top
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const UPLOAD_DIR = path.join(__dirname, 'uploads');


// Add these at the top with other requires
const fs = require('fs');
const multer = require('multer');

// Configure chunk storage
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileId = req.body.fileId;
    const tempDir = path.join(__dirname, 'uploads', 'temp', fileId);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Save with chunk index as filename
    cb(null, `${req.body.chunkIndex}.part`);
  }
});

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // PDFs go to public/pdfs, videos go to uploads
    const dest = file.mimetype === 'application/pdf' ? 
      path.join(__dirname, 'public', 'pdfs') : 
      path.join(__dirname, 'uploads');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const chunkUpload = multer({ storage: chunkStorage });

// Add these endpoints
app.post('/api/upload/video/start', (req, res) => {
  const fileId = Date.now().toString();
  res.json({ fileId, chunkSize: 5 * 1024 * 1024 }); // 5MB chunks
});

app.post('/api/upload/video/chunk', chunkUpload.single('chunk'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No chunk uploaded' });
  }
  
  res.json({ 
    success: true,
    chunkIndex: req.body.chunkIndex,
    fileId: req.body.fileId
  });
});

app.post('/api/upload/video/complete', (req, res) => {
  const { fileId, fileName } = req.body;
  const tempDir = path.join(__dirname, 'uploads', 'temp', fileId);
  const finalPath = path.join(__dirname, 'uploads', `${fileId}_${fileName}`);
  
  try {
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
    
    res.json({ 
      success: true,
      filePath: `/uploads/${fileId}_${fileName}`
    });
  } catch (error) {
    console.error('Error merging chunks:', error);
    res.status(500).json({ error: 'Failed to merge chunks' });
  }
});

// Serve static files from the "public/pdfs" directory
// Serve static files from the "public/pdfs" directory
app.use('/pdfs', express.static(path.join(__dirname, 'public', 'pdfs'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use(bodyParser.urlencoded({ extended: true }));

// Mock database with sample data matching your frontend structure
let musicSheets = [
  {
    id: "1",
    title: "Sample Composition",
    composer: "John Doe",
    year: 2000,
    key: "C Major",
    genres: ["Classical"],
    instruments: ["Piano"],
    link: "/pdfs/song2.pdf"
  },
  {
    id: "2",
    title: "My Favorite Song",
    composer: "Ioana Popescu",
    year: 2010,
    key: "G Major",
    genres: ["Rock", "Pop"],
    instruments: ["Guitar"],
    link: "/pdfs/song3.pdf"
  }
];


// Add this after the musicSheets array is defined
let generationInterval = null;
let isGenerating = false;

// Function to start generating fake music sheets
function startGenerating(interval = 5000) {
  if (isGenerating) return;
  isGenerating = true;
  broadcastStatus(); // Broadcast initial status
  
  generationInterval = setInterval(() => {
    const newId = Date.now().toString();
    const newSheet = generateMusicSheet(newId);
    musicSheets.unshift(newSheet); // Add to beginning of array
    
    // Broadcast to all WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'NEW_SHEET',
          data: newSheet
        }));
      }
    });
    
    console.log(`Generated new sheet: ${newSheet.title}`);
  }, interval);
}

// Function to stop generating
function stopGenerating() {
  if (!isGenerating) return;
  clearInterval(generationInterval);
  isGenerating = false;
  broadcastStatus(); // Broadcast final status
  console.log('Stopped generating music sheets');
}

// Add WebSocket endpoint
const server = app.listen(PORT, IP, () => {
  console.log(`Server running on http://${IP}:${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  ws.isAlive = true;

  // Heartbeat check
  const heartbeatInterval = setInterval(() => {
    if (ws.isAlive === false) {
      console.log('Terminating unresponsive connection');
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  }, 30000);

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'TOGGLE_GENERATION') {
        if (data.active) {
          startGenerating(data.interval || 5000);
        } else {
          stopGenerating();
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    clearInterval(heartbeatInterval);
    console.log('WebSocket connection closed');
  });

  // Send initial status
  ws.send(JSON.stringify({
    type: 'STATUS_UPDATE',
    status: 'connected',
    isGenerating
  }));
});

// Broadcast status to all clients
function broadcastStatus() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'STATUS_UPDATE',
        status: 'connected',
        isGenerating
      }));
    }
  });
}

// Add new endpoint to control generation
app.post('/api/generate', (req, res) => {
  const { active, interval } = req.body;
  
  if (active) {
    startGenerating(interval);
  } else {
    stopGenerating();
  }
  
  res.json({ success: true, isGenerating });
});

// Add endpoint to check generation status
app.get('/api/generate/status', (req, res) => {
  res.json({ isGenerating });
});


// Endpoint to get all music sheets
// In server.js, update the /api/sheets endpoint
app.get('/api/sheets', (req, res) => {
  let result = [...musicSheets];

  // ... (keep all your existing filtering logic)

  // Return the response in the same format as /api/music-sheets
  res.json({
    total: result.length,
    data: result,
  });
});

// REST API to fetch music sheets with filtering and sorting
app.get('/api/music-sheets', (req, res) => {
  try {
    const { _page = 1, _limit = 10, _sort = 'title', _order = 'asc', genres, instruments, q } = req.query;

    console.log('Query parameters:', req.query); // Debugging log
    console.log('Sort params:', req.query._sort, req.query._order); // Debugging log
    console.log('Filter params:', req.query.genres, req.query.instruments, req.query.q); // Debugging log

    // Clone the entities array to avoid mutating the original
    let filteredSheets = [...musicSheets];

     // Search filter (title OR composer)
     if (q) {
      const query = q.toLowerCase();
      filteredSheets = filteredSheets.filter(sheet =>
        sheet.title.toLowerCase().includes(query) ||
        sheet.composer.toLowerCase().includes(query)
      );
    }

    // Genre filter (OR logic)
    if (genres) {
      const genreList = genres.split(',').map(g => g.trim().toLowerCase());
      filteredSheets = filteredSheets.filter(sheet =>
        sheet.genres.some(genre => 
          genreList.includes(genre.toLowerCase())
        )
      );
    }

    // Instrument filter (OR logic)
    if (instruments) {
      const instrumentList = instruments.split(',').map(i => i.trim().toLowerCase());
      filteredSheets = filteredSheets.filter(sheet =>
        sheet.instruments.some(instrument => 
          instrumentList.includes(instrument.toLowerCase())
        )
      );
    }

    // Sorting
    if (_sort && _order) {
      filteredSheets.sort((a, b) => {
        const fieldA = a[_sort];
        const fieldB = b[_sort];

        if (typeof fieldA === 'string') {
          return _order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
        } else if (typeof fieldA === 'number') {
          return _order === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
      });
    }

    // Pagination
    const startIndex = (_page - 1) * _limit;
    const endIndex = startIndex + parseInt(_limit);
    const paginatedSheets = filteredSheets.slice(startIndex, endIndex);

    console.log('Filtered sheets:', filteredSheets.length);

    // Send the response
    res.json({
      total: filteredSheets.length,
      data: paginatedSheets,
    });
  } catch (error) {
    console.error('Error in /api/music-sheets:', error); // Log the error
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Helper function to find sheet by ID
const findSheetById = (id) => musicSheets.find(sheet => sheet.id === id);

// Validation middleware
const validateMusicSheet = (req, res, next) => {
  const { title, composer, year, key, genres, instruments } = req.body;

  // Validation rules
  const titleRegex = /^[a-zA-Z0-9\s\-_,.]+$/;
  const yearRegex = /^\d{4}$/;
  const keyRegex = /^[a-zA-Z0-9\s\-#]+$/;

  if (!title || !titleRegex.test(title)) {
    return res.status(400).json({ message: "Invalid or missing title." });
  }
  if (!composer || !titleRegex.test(composer)) {
    return res.status(400).json({ message: "Invalid or missing composer." });
  }
  if (!year || !yearRegex.test(year)) {
    return res.status(400).json({ message: "Invalid or missing year." });
  }
  if (!key || !keyRegex.test(key)) {
    return res.status(400).json({ message: "Invalid or missing key." });
  }
  if (!genres || !Array.isArray(genres) || genres.some(g => !titleRegex.test(g))) {
    return res.status(400).json({ message: "Invalid or missing genres." });
  }
  if (!instruments || !Array.isArray(instruments) || instruments.some(i => !titleRegex.test(i))) {
    return res.status(400).json({ message: "Invalid or missing instruments." });
  }

  next();
};

// Get all sheets with filtering
// Get all sheets with filtering and sorting (no pagination)
app.get('/api/sheets', (req, res) => {
  let result = [...musicSheets];

  // Apply filtering logic
  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    result = result.filter(sheet =>
      sheet.title.toLowerCase().includes(query) ||
      sheet.composer.toLowerCase().includes(query)
    );
  }

  if (req.query.genres) {
    const genresFilter = req.query.genres.split(',');
    console.log('Genres filter:', genresFilter);
    result = result.filter(sheet =>
      genresFilter.some(genre => sheet.genres.includes(genre))
    );
    console.log('Filtered result:', result);
  }

  if (req.query.instruments) {
    const instrumentsFilter = req.query.instruments.split(',');
    result = result.filter(sheet =>
      instrumentsFilter.some(instrument => sheet.instruments.includes(instrument))
    );
  }

  // Apply sorting logic
  if (req.query._sort) {
    const sortBy = req.query._sort;
    const order = req.query._order || 'asc';
    result.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Add the `x-total-count` header
  res.set('x-total-count', result.length);

  // Return the full result (no pagination)
  res.json(result);
});

// Get single sheet
app.get('/api/sheets/:id', (req, res) => {
  const sheet = findSheetById(req.params.id);
  if (sheet) {
    res.json(sheet);
  } else {
    res.status(404).json({ message: 'Sheet not found' });
  }
});


const upload = multer( {storage} ); // Adjust the destination as needed
// In server.js, update the /api/sheets endpoint
app.post('/api/sheets', upload.fields([{ name: 'musicFile', maxCount: 1 }, { name: 'videoFile', maxCount: 1 }]), async (req, res) => {
  try {
    // Extract form data
    const { title, composer, year, key, genres, instruments } = req.body;
    
    // Process genres and instruments from strings to arrays
    const genresArray = typeof genres === 'string' ? 
      genres.split(',').map(g => g.trim()) : 
      (Array.isArray(genres) ? genres : []);
    
    const instrumentsArray = typeof instruments === 'string' ? 
      instruments.split(',').map(i => i.trim()) : 
      (Array.isArray(instruments) ? instruments : []);

    // Process uploaded files
    const musicFile = req.files['musicFile'] ? req.files['musicFile'][0] : null;
    const videoFile = req.files['videoFile'] ? req.files['videoFile'][0] : null;

    // Generate file paths
    const musicFilePath = musicFile ? `/pdfs/${musicFile.filename}` : null;
    const videoFilePath = videoFile ? `/uploads/${videoFile.filename}` : null;

    // Create new sheet object
    const newSheet = {
      id: Date.now().toString(),
      title,
      composer,
      year: parseInt(year),
      key,
      genres: genresArray,
      instruments: instrumentsArray,
      link: musicFilePath,
      videoLink: videoFilePath,
      createdAt: new Date().toISOString()
    };

    // Add to mock database
    musicSheets.push(newSheet);

    // Send response
    res.status(201).json(newSheet);
  } catch (error) {
    console.error('Error creating new sheet:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update sheet
app.patch('/api/sheets/:id', (req, res) => {
  const sheet = findSheetById(req.params.id);
  if (!sheet) {
    return res.status(404).json({ message: 'Sheet not found' });
  }

  // Validate the updated data
  const { title, composer, year, key, genres, instruments } = req.body;
  const titleRegex = /^[a-zA-Z0-9\s\-_,.]+$/;
  const yearRegex = /^\d{4}$/;
  const keyRegex = /^[a-zA-Z0-9\s\-#]+$/;

  if (title && !titleRegex.test(title)) {
    return res.status(400).json({ message: 'Invalid title.' });
  }
  if (composer && !titleRegex.test(composer)) {
    return res.status(400).json({ message: 'Invalid composer.' });
  }
  if (year && !yearRegex.test(year)) {
    return res.status(400).json({ message: 'Invalid year.' });
  }
  if (key && !keyRegex.test(key)) {
    return res.status(400).json({ message: 'Invalid key.' });
  }
  if (genres && (!Array.isArray(genres) || genres.some(g => !titleRegex.test(g)))) {
    return res.status(400).json({ message: 'Invalid genres.' });
  }
  if (instruments && (!Array.isArray(instruments) || instruments.some(i => !titleRegex.test(i)))) {
    return res.status(400).json({ message: 'Invalid instruments.' });
  }

  // Update the music sheet
  Object.assign(sheet, req.body);
  res.json(sheet);
});

// Delete sheet
app.delete('/api/sheets/:id', (req, res) => {
  const index = musicSheets.findIndex(sheet => sheet.id === req.params.id);
  if (index !== -1) {
    musicSheets.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Sheet not found' });
  }
});

// Start server
// app.listen(PORT, IP, () => {
//   console.log(`Server running on http://${IP}:${PORT}`);
// });

module.exports = app; // Export the app for testing