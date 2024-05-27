import http from 'http';
import express, { Application, Request, Response } from 'express';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const app: Application = express();
const appPort = 3001 as const;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Expressサーバーを作成
const server = http.createServer(app);

// WebSocketサーバーを作成
const wss = new WebSocket.Server({ server });

const sessions: Record<string, Set<WebSocket>> = {};

wss.on('connection', (ws, req) => {
  const urlParams = new URLSearchParams(req.url?.substring(1));
  const sessionId = urlParams.get('sessionId');

  if (sessionId && sessions[sessionId]) {
    sessions[sessionId].add(ws);
    console.log(`New client connected to session ${sessionId}`); // eslint-disable-line no-console

    console.log('New client connected'); // eslint-disable-line no-console

    // メッセージを受信したときの処理
    ws.on('message', (message) => {
      console.log(`Received: ${message}`); // eslint-disable-line no-console
      // 接続されているすべてのクライアントにメッセージを送信
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`Server: ${message}`);
        }
      });
    });

    // クライアントが切断したときの処理
    ws.on('close', () => {
      sessions[sessionId].delete(ws);
      console.log('Client disconnected'); // eslint-disable-line no-console
    });
  } else {
    ws.close();
  }
});

// 新しいセッションを作成するエンドポイント
app.post('/create-session', (req: Request, res: Response) => {
  const sessionId = uuidv4();
  sessions[sessionId] = new Set();
  res.json({ sessionId, url: `http://localhost:${appPort}/?sessionId=${sessionId}` });
});

// 指定されたセッションの参加者リストを取得するエンドポイント
app.get('/session/:sessionId/clients', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  if (sessions[sessionId]) {
    res.json({
      clients: Array.from(sessions[sessionId]).map((ws, index) => `Client ${index + 1}`),
    });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
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
