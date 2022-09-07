import './App.css';
import { Routes, Route } from "react-router-dom";
import Video from './components/pages/Video';
import Playlist from './components/pages/Playlist';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from 'react';
import socket from './services/socket';


function App() {

  useEffect(() => {
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };

  }, [])

  return (
    <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Video />} />
          <Route path="playlist" element={<Playlist />} />
        </Routes>
    </div>
  );
}

export default App;
