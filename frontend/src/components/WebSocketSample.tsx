'use client';

import React from 'react';

export const WebSocketSample = () => {
  const [message, setMessage] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [ws, setWs] = React.useState<WebSocket | null>(null);

  React.useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001/socket');

    socket.onopen = () => {
      console.log('Connected to WebSocket server'); // eslint-disable-line no-console
      setWs(socket);
    };

    socket.onmessage = (event) => {
      console.log('Message from WebSocket server', event.data); // eslint-disable-line no-console
      setResponse(event.data);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server'); // eslint-disable-line no-console
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (ws && message) {
        ws.send(message);
        setMessage('');
      }
    },
    [message, ws]
  );

  return (
    <div>
      <h1>WebSocket with Next.js API Route</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button type="submit" onClick={sendMessage}>
        Send
      </button>
      <p>Response from server: {response}</p>
    </div>
  );
};
