'use client';

import React from 'react';

const Home = () => (
  <div>
    <h1>ホーム画面</h1>
    <p>Next.jsでWebSocketを試すことができます。</p>
    <a href="/c">リンクはこちら</a>
    <h2>envの確認</h2>
    <p>ベース：{process.env.NEXT_PUBLIC_BASE_URL}</p>
    <p>バックエンド：{process.env.NEXT_PUBLIC_BACKEND_URL}</p>
    <p>バック（WS）：{process.env.NEXT_PUBLIC_BACKEND_WS_URL}</p>
  </div>
);

export default Home;
