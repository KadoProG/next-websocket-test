'use client';

import { useCopyToClipboard } from '@/contexts/CopyContextProvider';
import { useUserInfo } from '@/contexts/UserInfoContextProvider';
import axios from '@/libs/axios';
import { redirect } from 'next/navigation';
import React from 'react';

export const Room = () => {
  const { sessionId, nickname } = useUserInfo();
  const { copyToClipboard } = useCopyToClipboard();
  React.useEffect(() => {
    if (!sessionId) {
      redirect('/c');
    }
  }, [sessionId]);
  const [message, setMessage] = React.useState('');
  const [response, setResponse] = React.useState<string[]>([]);
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [clients, setClients] = React.useState<string[]>([]);

  const connectWebSocket = (selectSessionId: string, selectNickname: string) => {
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_BACKEND_WS_URL}/?sessionId=${selectSessionId}&nickName=${selectNickname}`
    );

    socket.onopen = () => {
      console.log('Connected to WebSocket server'); // eslint-disable-line no-console
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from WebSocket server', data); // eslint-disable-line no-console

      if (data.type === 'clientList') {
        setClients(data.clients);
      } else {
        setResponse(data.messages);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server'); // eslint-disable-line no-console
      setClients([]);
    };

    setWs(socket);
  };

  React.useEffect(() => {
    if (!sessionId || !nickname) return;
    connectWebSocket(sessionId, nickname);
  }, [sessionId, nickname]);

  const sendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (ws && message) {
      ws.send(message);
      setMessage('');
    }
  };

  const removeClient = async (index: number) => {
    if (sessionId) {
      await axios.delete(`/session/${sessionId}/clients/${index}`);
    }
  };

  const onCopyButtonClick = React.useCallback(() => {
    copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/c/?c=${sessionId}`);
  }, [copyToClipboard, sessionId]);

  return (
    <div>
      <h1>参加しているチーム</h1>

      {sessionId && (
        <div>
          <p>Session ID: {sessionId}</p>
          <button type="button" onClick={onCopyButtonClick}>
            共有リンクをコピー
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button type="submit" onClick={sendMessage}>
            Send
          </button>

          <h2>メッセージリスト</h2>
          <ul>
            {response.map((messageData, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>{messageData}</li>
            ))}
          </ul>
          <h2>Connected Clients</h2>
          <ul>
            {clients.map((client, index) => (
              <li key={client}>
                {client}
                <button type="button" onClick={() => removeClient(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
