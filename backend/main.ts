import http from "http";
import express, { Application, Request, Response } from "express";
import WebSocket from "ws";

const app: Application = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Expressサーバーを作成
const server = http.createServer(app);

// WebSocketサーバーを作成
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");

  // メッセージを受信したときの処理
  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Server: ${message}`);
    // 接続されているすべてのクライアントにメッセージを送信
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server: ${message}`);
      }
    });
  });

  // クライアントが切断したときの処理
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

try {
  server.listen(PORT, () => {
    console.log(`dev server running at: http://localhost:${PORT}/`);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
