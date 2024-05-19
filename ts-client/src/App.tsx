import { useState, useEffect } from 'react'

import './App.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Routes, Route } from "react-router-dom";
import SocketContext from './hooks/context/SocketContext';
import socket from './services/socket';
import Navbar from './components/Navbar'
import Video from './pages/Video';
import Playlist from './pages/Playlist';

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
    <div className='App'>
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
  )
}

export default App
