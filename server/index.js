const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

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

// サーバーを起動
server.listen(3001, () => {
  console.log("WebSocket server is listening on port 3001");
});
