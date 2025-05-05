const app = require('./app');
const WebSocket = require('ws');
const generationService = require('./services/generationService');

const PORT = 5000;
const IP = '192.168.100.6';

const server = app.listen(PORT, IP, () => {
  console.log(`Server running on http://${IP}:${PORT}`);
});

// WebSocket setup
const wss = new WebSocket.Server({ server });
generationService.setWebSocketServer(wss);

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  ws.isAlive = true;

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
        generationService.handleGenerationToggle(data.active, data.interval);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    clearInterval(heartbeatInterval);
    console.log('WebSocket connection closed');
  });

  ws.send(JSON.stringify({
    type: 'STATUS_UPDATE',
    status: 'connected',
    isGenerating: generationService.isGenerating
  }));
});