const http = require('http');
const app = require('./src/app');
const { initWebSocket } = require('./src/ws/onlineUsers');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
