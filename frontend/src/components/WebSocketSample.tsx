'use client';

import React from 'react';

export const WebSocketSample = () => {
  const [message, setMessage] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = React.useState('');
  const [clients, setClients] = React.useState<string[]>([]);
  const [joinSessionId, setJoinSessionId] = React.useState('');

  const connectWebSocket = (selectSessionId: string) => {
    const socket = new WebSocket(`ws://localhost:3001/?sessionId=${selectSessionId}`);

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
        setResponse(event.data);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server'); // eslint-disable-line no-console
    };

    setWs(socket);
  };

  const createSession = async () => {
    const sessionResponse = await fetch('http://localhost:3001/create-session', { method: 'POST' });
    const data = await sessionResponse.json();
    setSessionId(data.sessionId);
    connectWebSocket(data.sessionId);
  };

  const joinSession = () => {
    if (joinSessionId) {
      setSessionId(joinSessionId);
      connectWebSocket(joinSessionId);
    }
  };

  const sendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (ws && message) {
      ws.send(message);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>WebSocket with Next.js API Route</h1>
      {!sessionId && (
        <div>
          <button type="button" onClick={createSession}>
            Create Session
          </button>
          <input
            type="text"
            value={joinSessionId}
            onChange={(e) => setJoinSessionId(e.target.value)}
            placeholder="Enter session ID to join"
          />
          <button type="button" onClick={joinSession}>
            Join Session
          </button>
        </div>
      )}
      {sessionId && (
        <div>
          <p>Session ID: {sessionId}</p>
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
          <h2>Connected Clients</h2>
          <ul>
            {clients.map((client) => (
              <li key={client}>{client}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
