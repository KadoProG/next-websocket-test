import http from 'http';
import express, { Application, Request, Response } from 'express';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const appPort = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL;

// CORSミドルウェアの設定
app.use(
  cors({
    origin: frontendUrl, // フロントエンドがホストされているオリジンを指定
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

interface Session {
  clients: Set<ClientInfo>;
  messages: { ws: ClientInfo; message: string; isMine?: boolean }[];
}

const sessions: Record<string, Session> = {};

// クライアントのリストをすべてのクライアントにブロードキャストする関数
const broadcastClientList = (sessionId: string) => {
  const clientList = Array.from(sessions[sessionId].clients).map(
    (clientInfo) => clientInfo.nickname
  );
  sessions[sessionId].clients.forEach((clientInfo) => {
    if (clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(JSON.stringify({ type: 'clientList', clients: clientList }));
    }
  });
};

// メッセージ履歴をすべてのクライアントにブロードキャストする関数
const broadcastMessageHistory = (sessionId: string) => {
  const messageHistory = sessions[sessionId].messages;
  sessions[sessionId].clients.forEach((clientInfo) => {
    if (clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(
        JSON.stringify({
          type: 'messageList',
          messages: messageHistory.map((message) => ({
            ...message,
            isMine: message.ws === clientInfo,
          })),
        })
      );
    }
  });
};

// クライアントを削除する関数
const removeClient = (sessionId: string, clientIndex: number) => {
  const clients = Array.from(sessions[sessionId].clients);
  const clientToRemove = clients[clientIndex];

  if (clientToRemove && clientToRemove.ws.readyState === WebSocket.OPEN) {
    clientToRemove.ws.close();
    sessions[sessionId].clients.delete(clientToRemove);
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
    sessions[sessionId].clients.add(clientInfo);

    console.log(`New client connected to session ${sessionId}`); // eslint-disable-line no-console

    // クライアントのリストをブロードキャスト
    broadcastClientList(sessionId);

    // メッセージ履歴を新しいクライアントに送信
    ws.send(JSON.stringify({ type: 'messageList', messages: sessions[sessionId].messages }));

    // メッセージを受信したときの処理
    ws.on('message', (message) => {
      console.log(`Received: ${message}`); // eslint-disable-line no-console
      // メッセージ履歴に追加
      sessions[sessionId].messages.push({ ws: clientInfo, message: String(message) });
      // メッセージ履歴をブロードキャスト
      broadcastMessageHistory(sessionId);
    });

    // クライアントが切断したときの処理
    ws.on('close', () => {
      console.log(`Client disconnected from session ${sessionId}`); // eslint-disable-line no-console
      sessions[sessionId].clients.delete(clientInfo);
      if (sessions[sessionId].clients.size === 0) {
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
  sessions[sessionId] = { clients: new Set(), messages: [] };
  res.json({ sessionId });
});

// 指定されたセッションの参加者リストを取得するエンドポイント
app.get('/session/:sessionId/clients', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  if (sessions[sessionId]) {
    res.json({
      clients: Array.from(sessions[sessionId].clients).map((clientInfo) => clientInfo.nickname),
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
    console.log(`FRONTEND_URL: ${frontendUrl}`); // eslint-disable-line no-console
    console.log(`PORT: ${appPort}`); // eslint-disable-line no-console
    setInterval(() => {
      console.log(sessions); // eslint-disable-line no-console
    }, 4000);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message); // eslint-disable-line no-console
  }
}
