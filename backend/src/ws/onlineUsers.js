const { WebSocketServer } = require('ws');

let wss = null;
const clients = new Set();

const initWebSocket = (server) => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);
    broadcast();

    ws.on('close', () => {
      clients.delete(ws);
      broadcast();
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });
};

const broadcast = () => {
  const count = clients.size;
  const msg = JSON.stringify({ type: 'online_count', count });
  clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
};

module.exports = { initWebSocket };
