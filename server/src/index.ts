import 'dotenv/config' 
import express from 'express'
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';

import { GetVideoInfo, DownloadVideoFromSelectedFormat, DownloadTest, DownloadMP3Audio } from './controllers/Video'
import { GetPlaylistInfoForm, GetPlaylistContents } from './controllers/Playlist';
const app = express()
const port = process.env.PORT
app.use(cors());
const httpServer = http.createServer(app)
const wss = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/playlist', GetPlaylistInfoForm)
app.post('/playlist-info', GetPlaylistContents)
app.get('/test', DownloadTest)

wss.on('connection', (socket) => {  
  console.log('a user connected', socket.id);

  socket.on("disconnect", (reason) => {
    console.log('user disconnected', socket.id, reason);

  });
});


app.post('/get-info', GetVideoInfo)
app.post('/download-mp3', DownloadMP3Audio(wss))

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})