# Next.js ＆ Express で WebSocket

2024/05/26
ChatGPT に試して、WebSocket の動作を作成してもらった。

- テキストの内容が他の人にもリアルタイムで適用されることを確認

## 起動方法

### フロントエンド

```shell
cd frontend # Change Directory from frontend
yarn # install package
yarn dev # frontend debuging http://localhost:3000
```

### バックエンド

```shell
cd backend # Change Directory from backend
yarn # install package
yarn start # backend debuging http://localhost:3001
```

### 苦戦したポイント

もともと Next.js の API Router で実現しようと思っていたが、Qiita の記事の中で`App Routerは無理`的なことが書いてあったため急遽 express で実施。

socket.io 的なライブラリも存在し、当初は Qiita を参考にそれをしようと思っていたが、pages タイプの解説のため受け付けませんでした。
