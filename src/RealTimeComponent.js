import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const generateTokenId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let tokenId = '';
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    tokenId += characters[randomIndex];
  }
  return tokenId;
};

const socket = io('http://localhost:5000', {
  transports: ['websocket'], // Ensure WebSocket transport is used
});

const RealTimeComponent = () => {
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token_id = generateTokenId(); // Generate a unique token_id for the user
    console.log('Generated token_id:', token_id); // Debug log to verify token generation

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Register with the server using the generated token_id
      socket.emit('register', { token_id });
      console.log(`Registered with token_id: ${token_id}`);
    });
    
    // Listen for private messages
    socket.on("message", (data) => {
        console.log(`Received private message: ${data.message}`);
    });
    
    // Send a private message to another user by their token_id
    socket.emit("private_message", {
        token_id: token_id,
        message: "Hello, Target User!",
    });

    /*socket.on('message', (msg) => {
      console.log('Message received from server:', msg);
      setMessages((prevMessages) => [...prevMessages, `Broadcast: ${msg}`]);
    });

    socket.on('private_message', (data) => {
      console.log('Private message received:', data.message);
      setMessages((prevMessages) => [...prevMessages, `Private: ${data.message}`]);
    });*/

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      // Properly clean up the socket on unmount
      socket.off('message');
      socket.off('private_message');
      socket.disconnect();
    };
  }, []); // Dependency array is empty to ensure only one setup happens

  const sendMessage = () => {
    if (message.trim() !== '') {
      if (recipient.trim() !== '') {
        socket.emit('private_message', { recipient_sid: recipient, message });
        console.log(`Sent private message to ${recipient}: ${message}`);
      } else {
        socket.emit('message', message);
        console.log(`Broadcasted message: ${message}`);
      }
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Real-Time Chat Component</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RealTimeComponent;
