import { useState } from 'react'

import './App.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar'
import Video from './pages/Video';
import Playlist from './pages/Playlist';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <Navbar />
      <Routes>
        <Route path="/" element={<Video />} />
        <Route path="playlist" element={<Playlist />} />
      </Routes>
    </div>
  )
}

export default App
