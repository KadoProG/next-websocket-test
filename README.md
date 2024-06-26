# Next.js ＆ Express で WebSocket

2024/05/26
ChatGPT に試して、WebSocket の動作を作成してもらった。

- テキストの内容が他の人にもリアルタイムで適用されることを確認
- 2024/05/30 Room を作成し、リンクを共有することで同じデータの connection にアクセスできるように実装
- 2024/06/05 簡単な Chat アプリを作成。リンクで参加する方式は変わらず、メッセージを配列として保持するように実装

### 画像

|                              |                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ルーム作成画面               | <img width="598" alt="スクリーンショット 2024-05-31 8 21 30" src="https://github.com/KadoProG/next-websocket-test/assets/65702927/51160cfc-d5de-4912-a6ef-090ac4f665c0">   |
| ルーム作成後の画面と招待画面 | <img width="1199" alt="スクリーンショット 2024-05-31 8 21 10" src="https://github.com/KadoProG/next-websocket-test/assets/65702927/323cd965-5cb1-47ed-a62b-35905ba0ed46">  |
| 招待後の画面                 | <img width="1279" alt="スクリーンショット 2024-06-05 10 40 41" src="https://github.com/KadoProG/next-websocket-test/assets/65702927/4b302e16-bc6d-4d71-b488-4e9342a4c815"> |

## 起動方法

### フロントエンド

```shell
cd frontend # Change Directory to frontend
cp .env.example .env
yarn # install package
yarn dev # frontend debuging http://localhost:3000
```

### バックエンド

```shell
cd backend # Change Directory to backend
cp .env.example .env
yarn # install package
yarn dev # backend debuging http://localhost:3001
```

### Docker を使用する場合

```shell
cp .env.example .env
docker-compose up --build -d
# front: http://localhost:3000
# backend: http://localhost:3001
```

以降は Docker Desktop 上で制御ができる

また、React の仕様上、hook 関連が２回動作するため、development では Client が２個描写されるので注意。

また、docker 上で`.env`ファイルを書き換えた場合は、再度`docker-compose up -d`を実行すると反映される

## 作業ログ

### 変更内容

- express のホットリロードに対応（[参考記事](https://qiita.com/koheiiwamura/items/38a7818da7300eb6e02b)）
  - 記事の`ts-node-env`のほうで実施

### 苦戦したポイント

もともと Next.js の API Router で実現しようと思っていたが、Qiita の記事の中で`App Routerは無理`的なことが書いてあったため急遽 express で実施。

socket.io 的なライブラリも存在し、当初は Qiita を参考にそれをしようと思っていたが、pages タイプの解説のため受け付けませんでした。
