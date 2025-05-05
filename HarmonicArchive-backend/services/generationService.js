const WebSocket = require('ws');
const generateMusicSheet = require('../generateMusicSheet');
const musicSheetService = require('./musicSheetService');

let generationInterval = null;
let isGenerating = false;
let wss = null; // Will be set by the server

exports.isGenerating = isGenerating;

exports.setWebSocketServer = (websocketServer) => {
  wss = websocketServer;
};

exports.startGenerating = (interval = 5000) => {
  if (isGenerating) return;
  isGenerating = true;
  broadcastStatus();
  
  generationInterval = setInterval(() => {
    const newId = Date.now().toString();
    const newSheet = generateMusicSheet(newId);
    musicSheetService.addMusicSheet(newSheet);
    
    broadcastNewSheet(newSheet);
    console.log(`Generated new sheet: ${newSheet.title}`);
  }, interval);
};

exports.stopGenerating = () => {
  if (!isGenerating) return;
  clearInterval(generationInterval);
  isGenerating = false;
  broadcastStatus();
  console.log('Stopped generating music sheets');
};

exports.handleGenerationToggle = (active, interval, websocketServer) => {
  wss = websocketServer;
  if (active) {
    this.startGenerating(interval);
  } else {
    this.stopGenerating();
  }
};

function broadcastStatus() {
  if (!wss) return;
  
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

function broadcastNewSheet(sheet) {
  if (!wss) return;
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'NEW_SHEET',
        data: sheet
      }));
    }
  });
}