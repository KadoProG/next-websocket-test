# Next.js ＆ Express で WebSocket

2024/05/26
ChatGPT に試して、WebSocket の動作を作成してもらった。

- テキストの内容が他の人にもリアルタイムで適用されることを確認

## 起動方法

```shell
yarn # install package
yarn dev # frontend debuging http://localhost:3000
yarn backend # backend debuging
```

### 苦戦したポイント

もともと Next.js の API Router で実現しようと思っていたが、Qiita の記事の中で`App Routerは無理`的なことが書いてあったため急遽 express で実施。型がかなりひどいため修正は必要ですね。

socket.io 的なライブラリも存在し、当初は Qiita を参考にそれをしようと思っていたが、pages タイプの解説のため受け付けませんでした。
