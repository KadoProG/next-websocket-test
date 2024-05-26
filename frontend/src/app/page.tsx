'use client';
import React, { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001/socket');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      console.log('Message from WebSocket server', event.data);
      setResponse(event.data);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = React.useCallback(() => {
    if (ws && message) {
      ws.send(message);
      setMessage('');
    }
  }, [message, ws]);

  return (
    <div>
      <h1>WebSocket with Next.js API Route</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
      <p>Response from server: {response}</p>
    </div>
  );
}
