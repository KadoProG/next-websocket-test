import http from 'http';
import express, { Application } from 'express';
import WebSocket from 'ws';

const app: Application = express();
const appPort = 3001 as const;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Expressサーバーを作成
const server = http.createServer(app);

// WebSocketサーバーを作成
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected'); // eslint-disable-line no-console

  // メッセージを受信したときの処理
  ws.on('message', (message) => {
    console.log(`Received: ${message}`); // eslint-disable-line no-console
    ws.send(`Server: ${message}`);
    // 接続されているすべてのクライアントにメッセージを送信
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server: ${message}`);
      }
    });
  });

  // クライアントが切断したときの処理
  ws.on('close', () => {
    console.log('Client disconnected'); // eslint-disable-line no-console
  });
});

try {
  server.listen(appPort, () => {
    console.log(`dev server running at: http://localhost:${appPort}/`); // eslint-disable-line no-console
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message); // eslint-disable-line no-console
  }
}
