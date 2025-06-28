import { useCallback, useEffect, useState } from 'react';

interface ClientInfo {
  ws: WebSocket;
  nickname: string;
}

interface MessageData {
  ws: ClientInfo;
  message: string;
  isMine?: boolean;
}

export const useWebSocket = (sessionId: string, nickname: string) => {
  const [response, setResponse] = useState<MessageData[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [clients, setClients] = useState<string[]>([]);
  const [isDisconnected, setIsDisconnected] = useState<boolean>(false);

  const connectWebSocket = useCallback((selectSessionId: string, selectNickname: string) => {
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
  }, []);

  const sendMessage = useCallback(
    (message: string) => {
      if (!ws) return;
      ws.send(message);
    },
    [ws]
  );

  useEffect(() => {
    if (!sessionId || !nickname) return;
    console.log('connectWebSocket'); // eslint-disable-line no-console
    connectWebSocket(sessionId, nickname);
  }, [sessionId, nickname, connectWebSocket]);

  return {
    response,
    clients,
    isDisconnected,
    sendMessage,
  };
};
