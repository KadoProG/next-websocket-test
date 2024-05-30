import http from 'http';
import express, { Application, Request, Response } from 'express';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app: Application = express();
const appPort = 3001 as const;

// CORSミドルウェアの設定
app.use(
  cors({
    origin: 'http://localhost:3000', // フロントエンドがホストされているオリジンを指定
    methods: ['GET', 'POST', 'DELETE'], // 許可するHTTPメソッド
    allowedHeaders: ['Content-Type'], // 許可するHTTPヘッダー
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// セッションとクライアント情報を保持するための構造
interface ClientInfo {
  ws: WebSocket;
  nickname: string;
}

const sessions: Record<string, Set<ClientInfo>> = {};

// クライアントのリストをすべてのクライアントにブロードキャストする関数
const broadcastClientList = (sessionId: string) => {
  const clientList = Array.from(sessions[sessionId]).map((clientInfo) => clientInfo.nickname);
  sessions[sessionId].forEach((clientInfo) => {
    if (clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(JSON.stringify({ type: 'clientList', clients: clientList }));
    }
  });
};

// クライアントを削除する関数
const removeClient = (sessionId: string, clientIndex: number) => {
  const clients = Array.from(sessions[sessionId]);
  const clientToRemove = clients[clientIndex];

  if (clientToRemove && clientToRemove.ws.readyState === WebSocket.OPEN) {
    clientToRemove.ws.close();
    sessions[sessionId].delete(clientToRemove);
    broadcastClientList(sessionId);
  }
};

// Expressサーバーを作成
const server = http.createServer(app);

// WebSocketサーバーを作成
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  const urlParams = new URLSearchParams(req.url?.substring(1));
  const sessionId = urlParams.get('sessionId');
  const nickname = urlParams.get('nickName');

  if (sessionId && sessions[sessionId] && nickname) {
    // クライアント情報をセッションに追加
    const clientInfo: ClientInfo = { ws, nickname };
    sessions[sessionId].add(clientInfo);

    console.log(`New client connected to session ${sessionId}`); // eslint-disable-line no-console

    // クライアントのリストをブロードキャスト
    broadcastClientList(sessionId);

    // メッセージを受信したときの処理
    ws.on('message', (message) => {
      console.log(`Received: ${message}`); // eslint-disable-line no-console
      // 接続されているすべてのクライアントにメッセージを送信
      sessions[sessionId].forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          const sendData = JSON.stringify({ type: 'messageList', messages: String(message) });
          client.ws.send(sendData);
        }
      });
    });

    // クライアントが切断したときの処理
    ws.on('close', () => {
      console.log(`Client disconnected from session ${sessionId}`); // eslint-disable-line no-console
      sessions[sessionId].delete(clientInfo);
      if (sessions[sessionId].size === 0) {
        delete sessions[sessionId];
      } else {
        // クライアントのリストをブロードキャスト
        broadcastClientList(sessionId);
      }
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
      clients: Array.from(sessions[sessionId]).map((clientInfo) => clientInfo.nickname),
    });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// クライアントを削除するエンドポイント
app.delete('/session/:sessionId/clients/:clientIndex', (req: Request, res: Response) => {
  const { sessionId, clientIndex } = req.params;
  if (sessions[sessionId]) {
    removeClient(sessionId, parseInt(clientIndex, 10));
    res.sendStatus(200);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

try {
  server.listen(appPort, () => {
    console.log(`dev server running at: http://localhost:${appPort}/`); // eslint-disable-line no-console
    setInterval(() => {
      console.log(sessions); // eslint-disable-line no-console
    }, 1000);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message); // eslint-disable-line no-console
  }
}
