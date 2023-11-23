import './App.css';
import { Routes, Route } from "react-router-dom";
import Video from './components/pages/Video';
import Playlist from './components/pages/Playlist';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from 'react';
import socket from './services/socket';
import SocketContext from './context/SocketContext';

function App() {

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [])

  return (
    <div className="App">
      <SocketContext.Provider value={{
        isConnected: connected, 
        connection: socket, 
        id: socket.id
      }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Video />} />
          <Route path="playlist" element={<Playlist />} />
        </Routes>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
