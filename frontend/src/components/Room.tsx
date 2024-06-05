'use client';

import { Input } from '@/components/common/Input';
import { TalkingCard } from '@/components/common/TalkingCard';
import { useCopyToClipboard } from '@/contexts/CopyContextProvider';
import { useUserInfo } from '@/contexts/UserInfoContextProvider';
import axios from '@/libs/axios';
import { redirect } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import styles from '@/components/Room.module.scss';

interface ClientInfo {
  ws: WebSocket;
  nickname: string;
}

export const Room = () => {
  const { sessionId, nickname } = useUserInfo();
  const { copyToClipboard } = useCopyToClipboard();
  React.useEffect(() => {
    if (!sessionId) {
      redirect('/c');
    }
  }, [sessionId]);

  const { control, handleSubmit, reset } = useForm<{ message: string }>({
    defaultValues: {
      message: '',
    },
  });
  const [response, setResponse] = React.useState<
    { ws: ClientInfo; message: string; isMine?: boolean }[]
  >([]);
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [clients, setClients] = React.useState<string[]>([]);
  const [isDisconnected, setIsDisconnected] = React.useState<boolean>(false);

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
      setIsDisconnected(true);
    };

    setWs(socket);
  };

  React.useEffect(() => {
    if (!sessionId || !nickname) return;
    connectWebSocket(sessionId, nickname);
  }, [sessionId, nickname]);

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!ws) return;
      handleSubmit(async (data) => {
        try {
          if (data.message === '') return;
          ws.send(data.message);
          reset();
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
        }
      })();
    },
    [handleSubmit, ws, reset]
  );

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
        <div className={styles.Room}>
          {isDisconnected && <p style={{ color: 'red' }}>切断されました</p>}
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
          <p>Session ID: {sessionId}</p>
          <button type="button" onClick={onCopyButtonClick}>
            共有リンクをコピー
          </button>

          <h2>メッセージリスト</h2>
          {response.map((messageObject, index) => (
            <TalkingCard
              message={messageObject.message}
              nickName={messageObject.ws.nickname}
              isMine={messageObject.isMine}
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            />
          ))}

          <form onSubmit={onSubmit} className={styles.Room__form}>
            <Input
              name="message"
              control={control}
              placeholder="入力しろ"
              disabled={isDisconnected}
            />
          </form>
        </div>
      )}
    </div>
  );
};
